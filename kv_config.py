# Cloudflare KV 配置
# 部署Worker后，将实际的Worker URL替换到这里

# Worker URL（部署后替换）
KV_WORKER_URL = "https://your-worker.workers.dev/feedback"

# KV Namespace ID（在Cloudflare Dashboard中创建KV后获取）
KV_NAMESPACE_ID = "your-kv-namespace-id"

# Worker认证（可选，用于保护API）
WORKER_AUTH_TOKEN = ""  # 如果Worker需要认证，在此设置