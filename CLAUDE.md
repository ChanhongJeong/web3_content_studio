# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

개인 유틸리티/도구 모음 프로젝트. 실생활에 필요한 계산기, 도구 등을 웹 기반으로 제작한다.

## 개발 규칙

- **웹/GUI 우선**: 모든 프로그램은 웹(HTML/CSS/JS) 또는 GUI로 제작. 터미널(CLI) 프로그램 금지.
- **단일 HTML 파일**: 간단한 도구는 외부 의존성 없이 HTML 하나로 완성 (CSS/JS 인라인).
- **한국어 UI**: 사용자 인터페이스는 한국어로 작성.
- **브라우저에서 바로 실행**: 별도 서버 없이 `index.html` 더블클릭으로 실행 가능하게.

## 현재 파일 구조

- `index.html` - 연봉 계산기 (실수령액 계산)
- `salary_calculator.py` - 연봉 계산기 Python 버전 (레거시)
- `연봉계산기.command` - macOS 더블클릭 실행용 스크립트
