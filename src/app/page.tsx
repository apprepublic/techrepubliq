"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/components/ThemeProvider";

export default function HomePage() {
  const { theme } = useTheme();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const rootNav = document.getElementById("rootNav");
    const rootFooter = document.getElementById("rootFooter");
    if (rootNav) rootNav.style.display = "";
    if (rootFooter) rootFooter.style.display = "none";

    const mainEl = document.querySelector("main");
    if (mainEl) {
      (mainEl as HTMLElement).style.paddingTop = "0";
      (mainEl as HTMLElement).style.minHeight = "0";
      (mainEl as HTMLElement).style.margin = "0";
      (mainEl as HTMLElement).style.overflow = "hidden";
      (mainEl as HTMLElement).style.height = "100vh";
    }

    const htmlEl = document.documentElement;
    const prevHtmlOverflow = htmlEl.style.overflow;
    const prevHtmlHeight = htmlEl.style.height;
    const prevHtmlBg = htmlEl.style.background;

    const prevBodyOverflow = document.body.style.overflow;
    const prevBodyHeight = document.body.style.height;
    const prevBodyBg = document.body.style.background;

    htmlEl.style.overflow = "hidden";
    htmlEl.style.height = "100%";
    document.body.style.overflow = "hidden";
    document.body.style.height = "100%";
    document.body.style.margin = "0";

    const applyThemeToOuter = (t: string) => {
      const bg = t === "dark" ? "#0A0912" : "#F6F5F9";
      htmlEl.style.background = bg;
      document.body.style.background = bg;
      if (mainEl) (mainEl as HTMLElement).style.background = bg;
      const iframe = document.getElementById("v7-iframe") as HTMLIFrameElement | null;
      if (iframe) iframe.style.background = bg;
    };

    applyThemeToOuter(theme);

    const getThemeCSS = (t: string) => {
      if (t === "dark") {
        return `
          :root {
            --text-primary: #F7F6FA !important;
            --text-secondary: #9C99AC !important;
            --bg-light: #0A0912 !important;
            --surface-light: #141220 !important;
            --border-light: #242233 !important;
            --bg-dark: #0A0912 !important;
            --text-on-dark: #F7F6FA !important;
            --text-on-dark-secondary: #9C99AC !important;
          }
          html { scroll-behavior: smooth; background: #0A0912 !important; }
          body { background: #0A0912 !important; margin: 0 !important; padding-top: 0 !important; color: #F7F6FA !important; }
          header.nav, #siteNav { display: none !important; }
          .hero {
            background: #0A0912 !important;
            padding-top: calc(200px + 68px) !important;
            color: #F7F6FA !important;
            position: relative; overflow: hidden;
          }
          .hero::before {
            content: '' !important; position: absolute !important; inset: -20px !important; z-index: 0 !important;
            display: block !important; opacity: 1 !important;
            background: linear-gradient(90deg, rgba(10,9,18,0.72) 0%, rgba(10,9,18,0.35) 45%, rgba(10,9,18,0.15) 100%), url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAB5sAAAMoCAIAAAB+jhAeAABVVGNhQlgAAFVUanVtYgAAAB5qdW1kYzJwYQARABCAAACqADibcQNjMnBhAAAAVS5qdW1iAAAAR2p1bWRjMm1hABEAEIAAAKoAOJtxA3VybjpjMnBhOjI1NDU1OTg5LWQ3YTQtNDg1OS1hZmNiLTcyMWFlNTc0NjVmYgAAAAxXanVtYgAAAClqdW1kYzJhcwARABCAAACqADibcQNjMnBhLmFzc2VydGlvbnMAAAAJ0Wp1bWIAAAA7anVtZEDLDDK7ikidpwsq1vR/Q2kTYzJwYS5pY29uAAAAABhjMnNoZJ8d0UTwTfAvmo4MhMi7BQAAABdiZmRiAGltYWdlL3N2Zyt4bWwAAAAJd2JpZGI8c3ZnIHdpZHRoPSI3MTYiIGhlaWdodD0iNzE2IiB2aWV3Qm94PSIwIDAgNzE2IDcxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTUwOC43NDkgMzE3LjM5OUM1MTYuNzc3IDI4Ny4zMTQgNTA4Ljk5MSAyNTMuODg0IDQ4NS4zODkgMjMwLjI4MkM0NjEuNzg4IDIwNi42ODEgNDI4LjM2IDE5OC44OTUgMzk4LjI3MyAyMDYuOTIzQzM3Ni4yMzEgMTg0LjkyOCAzNDMuMzkgMTc0Ljk1NiAzMTEuMTQ4IDE4My41OTZDMjc4LjkwNiAxOTIuMjM0IDI1NS40NSAyMTcuMjkyIDI0Ny4zNiAyNDcuMzYxQzIxNy4yOTEgMjU1LjQ1MSAxOTIuMjMzIDI3OC45MSAxODMuNTk1IDMxMS4xNDlDMTc0Ljk1NyAzNDMuMzkxIDE4NC45MjcgMzc2LjIzMiAyMDYuOTI0IDM5OC4yNzRDMTk4Ljg5NiA0MjguMzU5IDIwNi42ODMgNDYxLjc4OSAyMzAuMjg0IDQ4NS4zOTFDMjUzLjg4NSA1MDguOTkyIDI4Ny4zMTMgNTE2Ljc3OSAzMTcuNDAxIDUwOC43NUMzMzkuNDQyIDUzMC43NDUgMzcyLjI4NiA1NDAuNzE3IDQwNC41MjUgNTMyLjA3OUM0MzYuNzY3IDUyMy40NDEgNDYwLjIyMyA0OTguMzg0IDQ2OC4zMTMgNDY4LjMxNUM0OTguMzgzIDQ2MC4yMjQgNTIzLjQ0IDQzNi43NjYgNTMyLjA3OCA0MDQuNTI2QzU0MC43MTYgMzcyLjI4NSA1MzAuNzQ3IDMzOS40NDMgNTA4Ljc0OSAzMTcuNDAyVjMxNy4zOTlaTTQ3MC44OTkgMjQ0Ljc3NkM0ODYuODkyIDI2MC43NyA0OTMuNDg4IDI4Mi42MDEgNDkwLjY4NyAzMDMuNDEyTDQxNS41NzcgMjYwLjA0NkM0MTIuNDExIDI1OC4yMTggNDA4LjUwOSAyNTguMjE4IDQwNS4zNDUgMjYwLjA0NkwzMTcuNDAxIDMxMC44MlYyNzcuNTI2QzMxNy40MDEgMjc1LjE5MSAzMTguNjUyIDI3My4wMDUgMzIwLjY3NiAyNzEuODM3TDM4Ny42NDQgMjMzLjE3NEM0MTQuMTc4IDIxOC4zNTMgNDQ4LjM0NiAyMjIuMjIzIDQ3MC45MDEgMjQ0Ljc3Nkg0NzAuODk5Wk0zNTcuODM3IDMxMS4xNDRMMzk4LjI3NSAzMzQuNDkxVjM4MS4xODVMMzU3LjgzNyA0MDQuNTMyTDMxNy4zOTggMzgxLjE4NVYzMzQuNDkxTDM1Ny44MzcgMzExLjE0NFpNMjY0Ljc3NiAyNjkuNjkzQzI2NS4yMDcgMjM5LjMwNSAyODUuNjQ0IDIxMS42NDkgMzE2LjQ1MyAyMDMuMzkzQzMzOC4zIDE5Ny41NCAzNjAuNTA1IDIwMi43NDQgMzc3LjEyNyAyMTUuNTczTDMwMi4wMTQgMjU4LjkzN0MyOTguODQ4IDI2MC43NjQgMjk2Ljg5OCAyNjQuMTQ0IDI5Ni44OTggMjY3Ljc5OFYzNjkuMzQ2TDI2OC4wNjUgMzUyLjY5OUMyNjYuMDQzIDM1MS41MzEgMjY0Ljc3NiAzNDkuMzUzIDI2NC43NzYgMzQ3LjAxN1YyNjkuNjkxVjI2OS42OTNaTTIwMy4zOTEgMzE2LjQ1NEMyMDkuMjQ0IDI5NC42MDggMjI0Ljg1NCAyNzcuOTc4IDI0NC4yNzYgMjY5Ljk5OVYzNTYuNzNDMjQ0LjI3NiAzNjAuMzg0IDI0Ni4yMjYgMzYzLjc2MyAyNDkuMzkyIDM2NS41OTFMMzM3LjMzNyA0MTYuMzY1TDMwOC41MDMgNDMzLjAxM0MzMDYuNDgxIDQzNC4xODEgMzAzLjk2MSA0MzQuMTg4IDMwMS45MzkgNDMzLjAyTDIzNC45NzEgMzk0LjM1N0MyMDguODY4IDM3OC43ODkgMTk1LjEzOCAzNDcuMjYxIDIwMy4zOTEgMzE2LjQ1NFpNMjQ0Ljc3NSA0NzAuOUMyMjguNzgxIDQ1NC45MDYgMjIyLjE4NiA0MzMuMDc1IDIyNC45ODYgNDEyLjI2NEwzMDAuMDk2IDQ1NS42M0MzMDMuMjYzIDQ1Ny40NTcgMzA3LjE2NCA0NTcuNDU3IDMxMC4zMjggNDU1LjYzTDM5OC4yNzMgNDA0Ljg1NlY0MzguMTQ5QzM5OC4yNzMgNDQwLjQ4NSAzOTcuMDIyIDQ0Mi42NzEgMzk0Ljk5NyA0NDMuODM5TDMyOC4wMjkgNDgyLjUwMkMzMDEuNDk1IDQ5Ny4zMjIgMjY3LjMyNyA0OTMuNDUyIDI0NC43NzIgNDcwLjlIMjQ0Ljc3NVpNNDUwLjg5NyA0NDUuOTgyQzQ1MC40NjYgNDc2LjM3MSA0MzAuMDI5IDUwNC4wMjcgMzk5LjIyIDUxMi4yODNDMzc3LjM3MyA1MTguMTM2IDM1NS4xNjggNTEyLjkzMiAzMzguNTQ3IDUwMC4xMDJMNDEzLjY1OSA0NTYuNzM4QzQxNi44MjYgNDU0LjkxMSA0MTguNzc1IDQ1MS41MzIgNDE4Ljc3NSA0NDcuODc3VjM0Ni4zMjlMNDQ3LjYwOSAzNjIuOTc3QzQ0OS42MzEgMzY0LjE0NSA0NTAuODk3IDM2Ni4zMjMgNDUwLjg5NyAzNjguNjU5VjQ0NS45ODVWNDQ1Ljk4MlpNNTEyLjI4MiAzOTkuMjIxQzUwNi40MjkgNDIxLjA2OCA0OTAuODE5IDQzNy42OTcgNDcxLjM5NyA0NDUuNjc2VjM1OC45NDZDNDcxLjM5NyAzNTUuMjkyIDQ2OS40NDggMzUxLjkxMiA0NjYuMjgxIDM1MC4wODVMMzc4LjMzNiAyOTkuMzExTDQwNy4xNyAyODIuNjYzQzQwOS4xOTIgMjgxLjQ5NSA0MTEuNzEyIDI4MS40ODcgNDEzLjczNCAyODIuNjU1TDQ4MC43MDIgMzIxLjMxOEM1MDYuODA1IDMzNi44ODcgNTIwLjUzNiAzNjguNDE1IDUxMi4yODIgMzk5LjIyMVoiIGZpbGw9ImJsYWNrIi8+Cjwvc3ZnPgo=') center center / cover no-repeat, #0A0912) !important;
            background-repeat: no-repeat !important; background-position: center !important; background-size: cover !important;
            filter: blur(18px) !important; -webkit-filter: blur(18px) !important; transform: scale(1.08) !important;
          }
          .hero h1, .hero h2 { color: #F7F6FA !important; }
          .hero p.lede { color: #9C99AC !important; }
          
          /* ===== PANEL SECTION - DARK MODE - RESTORE GIF anim.gif ===== */
          .panel-section { background: transparent !important; color: #F7F6FA !important; margin-top: 0 !important; padding-top: 48px !important; padding-bottom: 80px !important; }
          .panel-hero-card { 
            position: relative !important;
            overflow: hidden !important;
            background: url('/assets/anim.gif') center center / cover no-repeat !important;
            border: 1px solid rgba(255,255,255,0.08) !important;
          }
          .panel-hero-card .stacked-words { color: #FFFFFF !important; }
          .panel-hero-card .stacked-words span { color: #FFFFFF !important; font-size: 48px !important; font-weight: 700 !important; line-height: 1.05 !important; }
          .info-box { background: rgba(26,24,40,0.8) !important; border: 1px solid rgba(255,255,255,0.08) !important; }
          .info-box h3 { color: #F7F6FA !important; }
          .info-box p { color: #9C99AC !important; }
          .info-icons span { background: rgba(255,255,255,0.08) !important; }
          .info-icons svg { stroke: #FF8A80 !important; }
          .stat-card { background: rgba(26,24,40,0.8) !important; border: 1px solid rgba(255,255,255,0.08) !important; }
          .stat-value { color: #F7F6FA !important; }
          .stat-label { color: #9C99AC !important; }
          .stat-card.featured { background: linear-gradient(135deg, #FF5C4D 0%, #C8102E 100%) !important; border-color: transparent !important; }
          .stat-card.featured .stat-value { color: #fff !important; }
          .stat-card.featured .stat-label { color: rgba(255,255,255,0.85) !important; }
          .stat-cta { background: rgba(255,255,255,0.92) !important; color: #C8102E !important; }
          
          .services { background: transparent !important; }
          .services .section-head h2 { color: #F7F6FA !important; }
          .services .section-head .eyebrow { color: #FF8A80 !important; background: rgba(200,16,46,0.12) !important; border-color: rgba(200,16,46,0.35) !important; }
          .service-card { background: rgba(26,24,40,0.8) !important; border: 1px solid rgba(255,255,255,0.08) !important; box-shadow: 0 8px 32px rgba(0,0,0,0.3) !important; }
          .service-card h3 { color: #F7F6FA !important; }
          .service-card p { color: #9C99AC !important; }
          .service-icon { background: rgba(200,16,46,0.15) !important; }
          .service-icon svg { stroke: #FF8A80 !important; }
          
          .process { background: transparent !important; color: #F7F6FA !important; }
          .process .section-head .eyebrow { color: #FF8A80 !important; background: rgba(200,16,46,0.12) !important; border-color: rgba(200,16,46,0.35) !important; }
          .process .section-head h2 { color: #F7F6FA !important; }
          .process .section-head p { color: #9C99AC !important; }
          .process-card { background: rgba(26,24,40,0.8) !important; border: 1px solid rgba(255,255,255,0.08) !important; }
          .process-num { color: rgba(255,255,255,0.5) !important; }
          .process-card h3 { color: #F7F6FA !important; }
          .process-card p { color: #9C99AC !important; }
          
          .testimonials { background: transparent !important; }
          .testimonials .section-head h2 { color: #F7F6FA !important; }
          .testimonials .section-head p { color: #9C99AC !important; }
          .testimonials .section-head .eyebrow { color: #FF8A80 !important; background: rgba(200,16,46,0.12) !important; border-color: rgba(200,16,46,0.35) !important; }
          .testimonial-card { background: rgba(26,24,40,0.8) !important; border: 1px solid rgba(255,255,255,0.08) !important; }
          .testimonial-card p.quote { color: #F7F6FA !important; }
          .testimonial-name { color: #F7F6FA !important; }
          .testimonial-role { color: #9C99AC !important; }
          .testimonial-quote-mark { background: rgba(200,16,46,0.15) !important; color: #FF8A80 !important; }
          
          .preview { background: transparent !important; color: #F7F6FA !important; }
          .preview .section-head h2 { color: #F7F6FA !important; }
          .preview .section-head p { color: #9C99AC !important; }
          .preview .section-head .eyebrow { color: #FF8A80 !important; background: rgba(200,16,46,0.12) !important; border-color: rgba(200,16,46,0.35) !important; }
          .mock-card { background: rgba(26,24,40,0.9) !important; border: 1px solid rgba(255,255,255,0.1) !important; color: #F7F6FA !important; box-shadow: 0 24px 60px rgba(0,0,0,0.5) !important; }
          .mock-label { color: #9C99AC !important; }
          .mock-price { color: #F7F6FA !important; }
          .mock-line { background: #242233 !important; }
          
          .cta { background: transparent !important; }
          .cta h2 { color: #F7F6FA !important; }
          .cta p.lede { color: #9C99AC !important; }
          .cta .eyebrow { color: #FF8A80 !important; background: rgba(200,16,46,0.12) !important; border-color: rgba(200,16,46,0.35) !important; }
          .contact-form { background: rgba(26,24,40,0.8) !important; border: 1px solid rgba(255,255,255,0.08) !important; }
          .form-field label { color: #9C99AC !important; }
          .form-field input, .form-field textarea { background: rgba(10,9,18,0.6) !important; border-color: #242233 !important; color: #F7F6FA !important; }
          .form-field input::placeholder, .form-field textarea::placeholder { color: #6B6876 !important; }
          .form-meta { color: #9C99AC !important; }
          footer { background: rgba(10,9,18,0.85) !important; backdrop-filter: blur(18px) !important; -webkit-backdrop-filter: blur(18px) !important; color: #F7F6FA !important; }
          html, body { overflow-x: hidden !important; }
          @media (max-width: 860px) {
            .hero {
              min-height: 100vh !important;
              min-height: 100dvh !important;
              display: flex !important;
              align-items: center !important;
              padding-top: calc(80px + 68px) !important;
              padding-bottom: 32px !important;
            }
            .hero .wrap { width: 100% !important; }
            #ring3d { width: 100% !important; max-width: 440px !important; }
          }
        `;
      } else {
        return `
          :root {
            --text-primary: #14121F !important;
            --text-secondary: #6B6876 !important;
            --bg-light: #F6F5F9 !important;
            --surface-light: #FFFFFF !important;
            --border-light: #E8E6F0 !important;
            --text-on-dark: #14121F !important;
            --text-on-dark-secondary: #6B6876 !important;
          }
          html { scroll-behavior: smooth; background: #F6F5F9 !important; }
          body { background: #F6F5F9 !important; margin: 0 !important; padding-top: 0 !important; color: #14121F !important; }
          header.nav, #siteNav { display: none !important; }
          .hero {
            background: #F6F5F9 !important;
            background-image: radial-gradient(ellipse at 20% 20%, rgba(200,16,46,0.06), transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(255,92,77,0.04), transparent 50%) !important;
            padding-top: calc(200px + 68px) !important;
            color: #14121F !important;
            position: relative; overflow: hidden;
          }
          .hero::before {
            content: '' !important; position: absolute !important; inset: -20px !important; z-index: 0 !important;
            display: block !important; opacity: 0.6 !important;
            background: linear-gradient(90deg, rgba(246,245,249,0.9) 0%, rgba(246,245,249,0.6) 45%, rgba(246,245,249,0.3) 100%), 
                        radial-gradient(ellipse at center, rgba(200,16,46,0.08), transparent 70%) !important;
            filter: blur(18px) !important; -webkit-filter: blur(18px) !important; transform: scale(1.08) !important;
          }
          .hero-ring-wrap::after {
            content: ''; position: absolute; inset: 0; z-index: 1;
            background: radial-gradient(ellipse at center, rgba(246,245,249,0.4), transparent 70%);
            pointer-events: none;
          }
          .hero h1 { color: #14121F !important; }
          .hero h1 span:first-child { color: #14121F !important; }
          .hero h1 span:last-child { color: #C8102E !important; }
          .hero p.lede { color: #6B6876 !important; }
          .hero-copy { position: relative; z-index: 2; }
          .hero-ring-wrap { position: relative; z-index: 2; }
          
          /* ===== PANEL SECTION - LIGHT MODE - RESTORE GIF anim.gif WITH LIGHT OVERLAY ===== */
          .panel-section { background: transparent !important; color: #14121F !important; margin-top: 0 !important; padding-top: 48px !important; padding-bottom: 80px !important; }
          .panel-hero-card { 
            position: relative !important;
            overflow: hidden !important;
            background: url('/assets/anim.gif') center center / cover no-repeat !important;
            border: 1px solid rgba(255,255,255,0.8) !important; 
            box-shadow: 0 8px 32px rgba(20,18,31,0.08) !important;
          }
          .panel-hero-card .stacked-words span { color: #FFFFFF !important; font-size: 48px !important; font-weight: 700 !important; line-height: 1.05 !important; }
          .info-box { background: rgba(255,255,255,0.85) !important; border: 1px solid rgba(255,255,255,0.8) !important; box-shadow: 0 4px 16px rgba(20,18,31,0.06) !important; }
          .info-box h3 { color: #14121F !important; }
          .info-box p { color: #6B6876 !important; }
          .info-icons span { background: rgba(200,16,46,0.08) !important; }
          .info-icons svg { stroke: #C8102E !important; }
          .stat-card { background: rgba(255,255,255,0.85) !important; border: 1px solid rgba(255,255,255,0.8) !important; box-shadow: 0 4px 16px rgba(20,18,31,0.06) !important; }
          .stat-value { color: #14121F !important; }
          .stat-label { color: #6B6876 !important; }
          .stat-card.featured { background: linear-gradient(135deg, #FF5C4D 0%, #C8102E 100%) !important; border-color: transparent !important; }
          .stat-card.featured .stat-value { color: #fff !important; }
          .stat-card.featured .stat-label { color: rgba(255,255,255,0.9) !important; }
          .stat-cta { background: #14121F !important; color: #fff !important; }
          
          .services { background: transparent !important; }
          .services .section-head h2 { color: #14121F !important; }
          .services .section-head .eyebrow { background: #FBE2E4 !important; color: #C8102E !important; }
          .service-card { background: rgba(255,255,255,0.85) !important; border: 1px solid rgba(255,255,255,0.8) !important; box-shadow: 0 4px 16px rgba(20,18,31,0.06) !important; }
          .service-card h3 { color: #14121F !important; }
          .service-card p { color: #6B6876 !important; }
          .service-icon { background: #FBE2E4 !important; }
          .service-icon svg { stroke: #C8102E !important; }
          
          .process { background: transparent !important; color: #14121F !important; }
          .process .section-head h2 { color: #14121F !important; }
          .process .section-head p { color: #6B6876 !important; }
          .process .section-head .eyebrow { background: #FBE2E4 !important; color: #C8102E !important; }
          .process-card { background: rgba(255,255,255,0.85) !important; border: 1px solid rgba(255,255,255,0.8) !important; box-shadow: 0 4px 16px rgba(20,18,31,0.06) !important; }
          .process-card h3 { color: #14121F !important; }
          .process-card p { color: #6B6876 !important; }
          .process-num { color: #C8102E !important; }
          
          .testimonials { background: transparent !important; }
          .testimonials .section-head h2 { color: #14121F !important; }
          .testimonials .section-head p { color: #6B6876 !important; }
          .testimonials .section-head .eyebrow { background: #FBE2E4 !important; color: #C8102E !important; }
          .testimonial-card { background: rgba(255,255,255,0.85) !important; border: 1px solid rgba(255,255,255,0.8) !important; box-shadow: 0 4px 16px rgba(20,18,31,0.06) !important; }
          .testimonial-card p.quote { color: #14121F !important; }
          .testimonial-name { color: #14121F !important; }
          .testimonial-role { color: #6B6876 !important; }
          .testimonial-quote-mark { background: #FBE2E4 !important; color: #C8102E !important; }
          
          .preview { background: transparent !important; color: #14121F !important; }
          .preview .section-head h2 { color: #14121F !important; }
          .preview .section-head p { color: #6B6876 !important; }
          .preview .section-head .eyebrow { background: #FBE2E4 !important; color: #C8102E !important; }
          .mock-card { background: rgba(255,255,255,0.9) !important; border: 1px solid rgba(255,255,255,0.8) !important; color: #14121F !important; box-shadow: 0 12px 32px rgba(20,18,31,0.1) !important; }
          .mock-label { color: #6B6876 !important; }
          .mock-price { color: #14121F !important; }
          .mock-line { background: #E8E6F0 !important; }
          
          .cta { background: transparent !important; }
          .cta h2 { color: #14121F !important; }
          .cta p.lede { color: #6B6876 !important; }
          .cta .eyebrow { background: #FBE2E4 !important; color: #C8102E !important; }
          .contact-form { background: rgba(255,255,255,0.85) !important; border: 1px solid rgba(255,255,255,0.8) !important; box-shadow: 0 8px 32px rgba(20,18,31,0.06) !important; }
          .form-field label { color: #6B6876 !important; }
          .form-field input, .form-field textarea { background: #fff !important; border-color: #E8E6F0 !important; color: #14121F !important; }
          .form-meta { color: #6B6876 !important; }
          footer { background: rgba(10,9,18,0.85) !important; backdrop-filter: blur(18px) !important; -webkit-backdrop-filter: blur(18px) !important; color: #F7F6FA !important; }
          html, body { overflow-x: hidden !important; }
          @media (max-width: 860px) {
            .hero {
              min-height: 100vh !important;
              min-height: 100dvh !important;
              display: flex !important;
              align-items: center !important;
              padding-top: calc(80px + 68px) !important;
              padding-bottom: 32px !important;
            }
            .hero .wrap { width: 100% !important; }
            #ring3d { width: 100% !important; max-width: 440px !important; }
          }
        `;
      }
    };

    const injectTheme = (t: string) => {
      const iframe = iframeRef.current || (document.getElementById("v7-iframe") as HTMLIFrameElement | null);
      if (!iframe?.contentDocument) return;
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;
        let styleEl = doc.getElementById("global-header-offset") as HTMLStyleElement | null;
        if (!styleEl) {
          styleEl = doc.createElement("style");
          styleEl.id = "global-header-offset";
          doc.head.appendChild(styleEl);
        }
        styleEl.textContent = getThemeCSS(t);
        doc.documentElement.setAttribute("data-theme", t);
      } catch (e) {}
    };

    const iframe = iframeRef.current;
    const onLoad = () => {
      injectTheme(theme);
      if (window.location.hash) {
        const hash = window.location.hash.slice(1);
        const doc = iframe?.contentDocument;
        const el = doc?.getElementById(hash);
        if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
      }
    };

    if (iframe) {
      iframe.addEventListener("load", onLoad);
      if (iframe.contentDocument?.readyState === "complete") {
        injectTheme(theme);
      }
    }

    const onThemeChange = (e: Event) => {
      const custom = e as CustomEvent;
      const newTheme = custom.detail?.theme || theme;
      applyThemeToOuter(newTheme);
      injectTheme(newTheme);
    };
    window.addEventListener("themeChange", onThemeChange as EventListener);

    const onHashChange = () => {
      const iframeEl = document.getElementById("v7-iframe") as HTMLIFrameElement | null;
      if (!iframeEl?.contentDocument) return;
      const hash = window.location.hash.slice(1);
      if (!hash) return;
      const el = iframeEl.contentDocument.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    };
    window.addEventListener("hashchange", onHashChange);

    return () => {
      htmlEl.style.overflow = prevHtmlOverflow;
      htmlEl.style.height = prevHtmlHeight;
      (htmlEl as HTMLElement).style.background = prevHtmlBg;
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.height = prevBodyHeight;
      document.body.style.background = prevBodyBg;
      if (rootFooter) rootFooter.style.display = "";
      if (iframe) iframe.removeEventListener("load", onLoad);
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("themeChange", onThemeChange as EventListener);
    };
  }, [theme]);

  return (
    <>
      <style>{`
        main { padding-top: 0 !important; min-height: 0 !important; margin: 0 !important; overflow: hidden !important; height: 100vh !important; }
        html, body { margin: 0; padding: 0; overflow: hidden !important; height: 100% !important; }
        html[data-theme="dark"] body, html.dark body { background: #0A0912 !important; }
        html[data-theme="light"] body, html.light body { background: #F6F5F9 !important; }
        html[data-theme="dark"] main { background: #0A0912 !important; }
        html[data-theme="light"] main { background: #F6F5F9 !important; }
        #v7-iframe { width: 100%; height: 100vh; border: none; display: block; overflow: auto; }
        body::-webkit-scrollbar { display: none; }
      `}</style>
      <iframe
        ref={iframeRef}
        id="v7-iframe"
        src="/TechRepubliQ-preview_v7.html"
        title="TechRepubliQ v7"
        loading="eager"
      />
    </>
  );
}
