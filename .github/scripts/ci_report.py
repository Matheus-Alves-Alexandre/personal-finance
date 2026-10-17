"""Render the CI gate report and fail closed on missing or unsuccessful checks."""
import json
import os
from pathlib import Path
import sys

REQUIRED = {
    "changes": "Preparação e testes dos auxiliares de CI",
    "formatting": "Formatação",
    "translation-parity": "Traduções",
    "frontend-check": "Interface: testes, tipos, lint e builds",
    "rust-check": "Backend: testes, Clippy e compilação",
    "app-e2e": "Aplicação e perfis: testes de ponta a ponta",
}


def report(needs):
    checks = dict(REQUIRED)
    outputs = needs.get("changes", {}).get("outputs", {})
    for platform in ("android", "ios"):
        if outputs.get(platform) == "true":
            checks[f"{platform}-check"] = f"Compilação {platform}"
    failed = [key for key in checks if needs.get(key, {}).get("result") != "success"]
    lines = ["# Verificações do Personal Finance", "",
             "| Verificação | Resultado |", "| --- | --- |"]
    for key, label in checks.items():
        result = needs.get(key, {}).get("result", "missing")
        if result not in {"success", "failure", "cancelled", "skipped"}:
            result = "missing"
        lines.append(f"| {label} | {result} |")
    lines += ["", "**REPROVADO: publicação bloqueada.**" if failed else
              "**APROVADO: verificações concluídas.**", "",
              "Consulte os passos em vermelho e os artefatos `ci-*` desta execução. "
              "Eles contêm logs e relatórios dos testes; nenhuma atualização é "
              "instalada automaticamente no computador.", ""]
    return "\n".join(lines), not failed


def main():
    try:
        needs = json.loads(os.environ.get("CI_NEEDS_JSON", "{}"))
        if not isinstance(needs, dict):
            raise ValueError("Expected an object with job results")
        markdown, passed = report(needs)
    except (ValueError, TypeError, AttributeError) as error:
        markdown = f"# Verificações do Personal Finance\n\nREPROVADO: relatório inválido ({error}).\n"
        passed = False
    output = Path("reports/ci-summary.md")
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(markdown, encoding="utf-8")
    if os.environ.get("GITHUB_STEP_SUMMARY"):
        with open(os.environ["GITHUB_STEP_SUMMARY"], "a", encoding="utf-8") as summary:
            summary.write(markdown)
    print(markdown)
    return 0 if passed else 1


if __name__ == "__main__":
    sys.exit(main())
