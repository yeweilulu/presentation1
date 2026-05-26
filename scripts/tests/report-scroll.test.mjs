import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const cssPath = resolve("/Users/yewei/Documents/sogood/presentation/styles/main.css");
const css = readFileSync(cssPath, "utf8");

const finalReportBodyRule = /\.app-shell\.final-report-active\s+\.report-panel\s*>\s*\.panel-body\s*\{[\s\S]*?\}/m.exec(css)?.[0] ?? "";
const finalReportStreamRule = /\.app-shell\.final-report-active\s+\.report-stream\s*\{[\s\S]*?\}/m.exec(css)?.[0] ?? "";

if (!finalReportBodyRule) {
  throw new Error("缺少 .app-shell.final-report-active .report-panel > .panel-body 样式规则，最终报告父容器无法接管滚动。");
}

if (!/overflow-y\s*:\s*auto|overflow-y\s*:\s*scroll/m.test(finalReportBodyRule)) {
  throw new Error("最终报告父容器没有开启纵向滚动。");
}

if (!/scrollbar-gutter\s*:\s*stable/m.test(finalReportBodyRule)) {
  throw new Error("最终报告父容器没有稳定滚动槽位。");
}

if (!/flex\s*:\s*1\s+1\s+0/m.test(finalReportBodyRule) && !/height\s*:/m.test(finalReportBodyRule) && !/max-height\s*:/m.test(finalReportBodyRule)) {
  throw new Error("最终报告父容器没有明确的高度约束。");
}

if (!finalReportStreamRule) {
  throw new Error("缺少 .app-shell.final-report-active .report-stream 样式规则。");
}

if (!/overflow\s*:\s*visible/m.test(finalReportStreamRule)) {
  throw new Error("report-stream 仍在自己接管滚动，没有把溢出交给父容器。");
}

console.log("report parent scroll css assertions passed");
