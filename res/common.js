var pathname = window.location.pathname
if (pathname.lastIndexOf("/", pathname.length - 1) !== -1) {
    pathname = pathname.substring(0, pathname.length - 1)
}

var queryResultId = 0

var activeMerchantId = null
var activeMerchantCode = null
var activeHomeArea = null
var activeMerchantName = null
var activeClassifier = null

;
(function () {
    $(document).on('paste', '[contenteditable]', function (e) {
        e.preventDefault()
        var text = ''
        if (e.clipboardData || e.originalEvent.clipboardData) {
            text = (e.originalEvent || e).clipboardData.getData('text/plain')
        } else if (window.clipboardData) {
            text = window.clipboardData.getData('Text')
        }
        if (document.queryCommandSupported('insertText')) {
            document.execCommand('insertText', false, text)
        } else {
            document.execCommand('paste', false, text)
        }
    })

    $('.clearResult').click(function () {
        $('.result').html('')
    })

    $(document).on('dblclick', 'table td', function (e) {
        e.preventDefault()
        var hasClass = $(this).hasClass('highlightCell')
        $('table td.highlightCell').removeClass('highlightCell')
        if (!hasClass) {
            var cellValue = $(this).text()
            if (cellValue === '') return

            $('table td').each(function (index, td) {
                if ($(td).text() === cellValue) {
                    $(this).addClass('highlightCell')
                }
            })
        }
    })
})()
