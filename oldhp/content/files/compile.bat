@echo off
vc test.c
c:\vsm_read.exe e test.vsm
notepad compiler.log
