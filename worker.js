// Cloudflare Worker - 反馈接收与 Windows 更新信息系统
// 部署方法：
// 1. 登录 https://dash.cloudflare.com
// 2. 创建一个新的 Worker
// 3. 粘贴此代码
// 4. 绑定KV Namespace（名称：FEEDBACK_KV）
// 5. 部署并获取Worker URL

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '*';

    if (request.method === 'GET' && url.pathname === '/api/win-version') {
      return jsonResponse(200, {
        ok: true,
        versionCode: parseInt(env.WIN_VERSION_CODE || '1', 10) || 1,
        versionName: env.WIN_VERSION_NAME || '1.0.0',
        downloadUrl: env.WIN_DOWNLOAD_URL || 'https://starbrowser.zztxer.dpdns.org',
        changelog: env.WIN_CHANGELOG || '',
        forceUpdate: false
      }, origin);
    }

    // GET请求 - 返回状态页面
    if (request.method === 'GET' && url.pathname === '/') {
      return new Response(JSON.stringify({
        service: "StarBrowser Feedback API",
        status: "running",
        version: "1.0.0",
        endpoints: {
          POST: "/feedback - 提交反馈",
          GET: "/api/win-version - Windows 更新信息"
        }
      }), jsonHeaders(200, origin));
    }

    // POST请求 - 接收反馈
    if (request.method === 'POST') {
      try {
        const data = await request.json();
        
        // 验证必要字段
        if (!data.content) {
          return new Response(JSON.stringify({ error: 'Missing content' }), { 
            status: 400,
            headers: jsonHeaders(400, origin).headers
          });
        }

        // 生成唯一ID（时间戳+随机数）
        const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // 检查KV是否可用
        if (!env.FAN) {
          return new Response(JSON.stringify({ 
            error: 'KV namespace not configured',
            hint: 'Please bind FAN in wrangler.jsonc'
          }), jsonHeaders(500, origin));
        }
        
        // 存储到KV
        await env.FAN.put(id, JSON.stringify({
          id: id,
          content: data.content,
          email: data.email || '',
          timestamp: data.timestamp || new Date().toISOString(),
          user_agent: data.user_agent || ''
        }));

        return new Response(JSON.stringify({ 
          success: true, 
          id: id,
          message: 'Feedback received' 
        }), jsonHeaders(200, origin));
      } catch (error) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: error.message,
          stack: error.stack
        }), jsonHeaders(500, origin));
      }
    }

    // 其他方法
    return new Response('Method not allowed', { status: 405, headers: { 'Access-Control-Allow-Origin': origin } });
  }
};

function jsonHeaders(status, origin) {
  return {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    }
  };
}

function jsonResponse(status, data, origin) {
  return new Response(JSON.stringify(data), jsonHeaders(status, origin));
}

