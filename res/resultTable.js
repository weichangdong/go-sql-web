(function () {
    function createHead(queryResultId, rowUpdateReady, result, isTableInLinked, contextMenuHolder) {
        var head = '<thead><tr class="headRow" queryResultId="' + queryResultId + '">'
        if (rowUpdateReady) {
            head += '<td><div class="chk checkAll"></div></td>'
        }
        head += '<td class="headCell">#</td>'

        contextMenuHolder.columnNames = contextMenuHolder.columnNames || {}
        contextMenuHolder.allColumnNames = contextMenuHolder.allColumnNames || {}

        for (var j = 0; j < result.Headers.length; ++j) {
            var headName = result.Headers[j]
            contextMenuHolder.allColumnNames[headName] = true
            head += '<td class="headCell ' + $.escapeContextMenuCssName(headName) + '">' + headName + '</td>'
            if (contextMenuHolder.hasRows && $.isInLinkedTableField(result.TableName, headName)) {
                contextMenuHolder.columnNames[headName] = true
            }
        }
        return head + '</tr></thead>'
    }

    function createRows(result, rowUpdateReady) {
        var rowHtml = ''
        for (var i = 0; i < result.Rows.length; i++) {
            rowHtml += '<tr class="dataRow">'
            if (rowUpdateReady) {
                rowHtml += '<td><div class="chk checkMe"><input type="checkbox"></div></td>'
            }

            for (var j = 0; j < result.Rows[i].length; ++j) {
                var cellValue = result.Rows[i][j]

                rowHtml += '<td class="dataCell '
                if (result.Headers) {
                    rowHtml += $.escapeContextMenuCssName(result.Headers[j - 1])
                }

                rowHtml += '">' + cellValue + '</td>'
            }

            rowHtml += '</tr>'
        }
        return rowHtml
    }

    function createMultipleTenantsExecutable(queryResultId, result, hasRows) {
        var holder = {}
        if (!supportsMultipleTenantsExecutable(result, hasRows, holder)) return ""

        return '<span id="multipleTenantsExecutable' + queryResultId + '">'
            + '<span class="opsSpan" merchantIdIndex="' + holder.tiIndex
            + '" merchantNameIndex="' + holder.tnameIndex
            + '" merchantCodeIndex="' + holder.tcodeIndex
            + '">ExecuteSqlAmongBelowTenants</span>'
            + '<span>BatchSize:<input class="batchSize" placeholder="20">'
            + '<label><input class="confirm" type="checkbox" name="checkbox" value="value">Confirm to Continue?</label>'
            + '</span>'
            + '</span>'
    }

    function findColumnIndex(headers, headerName) {
        for (var i = 0; i < headers.length; ++i) {
            var upperCaseHeader = headers[i].toUpperCase()
            if (upperCaseHeader === headerName) return i
        }

        return -1
    }

    function supportsMultipleTenantsExecutable(result, hasRows, holder) {
        if (!hasRows) return false

        var headers = result.Headers
        holder.tiIndex = findColumnIndex(headers, 'MERCHANT_ID')
        holder.tnameIndex = findColumnIndex(headers, 'MERCHANT_NAME')
        holder.tcodeIndex = findColumnIndex(headers, 'MERCHANT_CODE')

        return holder.tiIndex >= 0 && holder.tnameIndex >= 0 && holder.tcodeIndex >= 0
    }

    function createSummaryTable(classifier, tid, tname, queryResultId, result, hasRows) {
        return '<div class="executionResult" id="executionResultDiv' + queryResultId + '" tid="' + tid + '" classifier="' + classifier + '">' +
            '<table class="executionSummary"><tr>' +
            '<td>Tenant:&nbsp;' + tname + '</td><td>Db:&nbsp;' + (result.DatabaseName || '') + '</td>' +
            (result.TableName !== '' ? '<td>Table:&nbsp;' + result.TableName + '</td>' : '') +
            '<td>Rows:&nbsp;' + (hasRows ? result.Rows.length : '0') + '</td>' +
            '<td>Time:&nbsp;' + result.ExecutionTime + '</td>' +
            '<td>Cost:&nbsp;' + result.CostTime + '</td>' +
            '<td>' +
            '<span class="opsSpan" id="closeResult' + queryResultId + '">Close</span>' +
            createMultipleTenantsExecutable(queryResultId, result, hasRows) +
            '</td>' +
            '<td' + (result.Error && (' class="error">' + result.Error) || ('>' + result.Msg)) + '</td>' +
            '</tr></table>'
    }

    $.createResultTableHtml = function (result, sql, rowUpdateReady, resultId, contextMenuHolder, classifier, tid, tname) {
        var hasRows = result.Rows && result.Rows.length > 0
        var table = createSummaryTable(classifier, tid, tname, resultId, result, hasRows)
        table += '<div id="divTranspose' + resultId + '" class="divTranspose"></div>'
        table += '<div id="divResult' + resultId + '" class="divResult">'
        table += '<div class="operateAreaDiv">'
        if (hasRows) {
            table += '<input id="searchTable' + resultId + '" class="searchTable" placeholder="Type to search">'
        }
        table += '<button id="expandRows' + resultId + '">Expand Rows</button>'
        if (rowUpdateReady) {
            table += '<input type="checkbox" id="checkboxEditable' + resultId + '" class="checkboxEditable">'
                + '<label for="checkboxEditable' + resultId + '">Editable?</label>'
                + '<span class="editButtons"><button id="copyRow' + resultId + '" class="copyRow">Copy Rows</button>'
                + '<button id="deleteRows' + resultId + '">Delete Rows</button>'
                + '<button id="saveUpdates' + resultId + '">Commit</button>'
                + '<button id="rowTranspose' + resultId + '">Transpose</button>'
                + '</span>'
        }
        table += '<span class="opsSpan" id="reExecuteSql' + resultId + '" tid="' + tid + '" tname="' + tname + '" classifier="' + classifier + '">Re Run:</span>'
        table += '<span class="sqlTd" contenteditable="true">' + sql + '</span>'
        table += '</div>'

        contextMenuHolder.queryResultId = resultId
        contextMenuHolder.tableName = result.TableName
        contextMenuHolder.hasRows = hasRows

        table += '<div id="collapseDiv' + resultId + '" class="collapseDiv">' +
            '<table id="queryResult' + resultId + '" class="queryResult">'

        if (result.Headers && result.Headers.length > 0) {
            var isTableInLinked = hasRows && result.TableName !== '' && $.isInLinkedTable(result.TableName)
            table += createHead(resultId, rowUpdateReady, result, isTableInLinked, contextMenuHolder)
        }

        table += '<tbody>'
        if (hasRows) {
            table += createRows(result, rowUpdateReady)
        } else if (result.Rows && result.Rows.length == 0) {
            table += '<tr class="dataRow clonedRow">'
            if (rowUpdateReady) {
                table += '<td><div class="chk checkMe"><input type="checkbox"></div></td>'
            }
            table += '<td class="dataCell">' + new Array(result.Headers.length + 1).join('</td><td class="dataCell">') + '</td></tr>'
        }
        table += '</tbody></table></div><br/><div></div>'

        return table
    }
})()