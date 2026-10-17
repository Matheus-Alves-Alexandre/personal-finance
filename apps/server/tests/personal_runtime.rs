//! Exercise the real router: personal finance works, AI/agent APIs stay absent.
#![allow(clippy::unwrap_used, reason = "test assertions")]

use axum::{body::Body, http::Request};
use base64::{engine::general_purpose::STANDARD, Engine};
use tower::ServiceExt;
use wealthfolio_server::{api::app_router_from_config, config::Config};

#[tokio::test]
async fn finance_routes_work_without_exposing_ai_or_agent_access() {
    let directory = tempfile::tempdir().unwrap();
    std::env::set_var("WF_DATA_DIR", "");
    std::env::set_var("WF_DB_PATH", directory.path().join("app.db"));
    std::env::set_var("WF_SECRET_FILE", directory.path().join("secrets.json"));
    std::env::set_var("WF_SECRET_KEY", STANDARD.encode([42_u8; 32]));
    std::env::set_var("WF_LISTEN_ADDR", "127.0.0.1:0");
    // A legacy configuration must not re-enable the removed server.
    std::env::set_var("WF_MCP_ENABLED", "true");
    std::env::remove_var("WF_AUTH_PASSWORD_HASH");
    std::env::remove_var("WF_OIDC_ISSUER_URL");
    std::env::remove_var("WF_OIDC_CLIENT_ID");
    let config = Config::from_env().unwrap();
    let app = app_router_from_config(&config).await.unwrap();

    for path in ["/api/v1/accounts", "/api/v1/spending/settings"] {
        let response = app
            .clone()
            .oneshot(Request::builder().uri(path).body(Body::empty()).unwrap())
            .await
            .unwrap();
        assert_eq!(response.status(), 200, "{path}");
    }
    for (method, path) in [
        ("GET", "/api/v1/ai/providers"),
        ("POST", "/api/v1/ai/chat/stream"),
        ("GET", "/api/v1/ai/threads"),
        ("GET", "/api/v1/agent-access/status"),
        ("POST", "/api/v1/agent-access/tokens"),
        ("POST", "/mcp"),
    ] {
        let response = app
            .clone()
            .oneshot(
                Request::builder()
                    .method(method)
                    .uri(path)
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(response.status(), 404, "{method} {path}");
    }
}
