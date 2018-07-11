package main

import (
	"flag"
	"github.com/BurntSushi/toml"
	"github.com/bingoohuang/go-utils"
	"log"
	"strings"
)

type YogaProxy struct {
	Proxy string
}

type AppConfig struct {
	ContextPath   string
	ListenPort    int
	MaxQueryRows  int
	DataSource    string
	DefaultTenant string

	DevMode      bool // to disable css/js minify
	AuthBasic    bool
	MultiTenants bool
	ImportDb     bool

	YogaProxy map[string]YogaProxy

	EncryptKey  string
	CookieName  string
	RedirectUri string
	LocalUrl    string
	ForceLogin  bool
}

var configFile string
var appConfig AppConfig

var authParam go_utils.MustAuthParam

func init() {
	flag.StringVar(&configFile, "configFile", "appConfig.toml", "config file path")

	flag.Parse()
	if _, err := toml.DecodeFile(configFile, &appConfig); err != nil {
		log.Panic("config file decode error", err.Error())
	}

	if appConfig.ContextPath != "" && strings.Index(appConfig.ContextPath, "/") < 0 {
		appConfig.ContextPath = "/" + appConfig.ContextPath
	}
}
