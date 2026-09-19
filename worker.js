// Cloudflare Worker - 反馈接收系统
// 部署方法：
// 1. 登录 https://dash.cloudflare.com
// 2. 创建一个新的 Worker
// 3. 粘贴此代码
// 4. 绑定KV Namespace（名称：FEEDBACK_KV）
// 5. 部署并获取Worker URL

export default {
  async fetch(request, env, ctx) {
    // GET请求 - 返回状态页面
    if (request.method === 'GET') {
      return new Response(JSON.stringify({
        service: "StarBrowser Feedback API",
        status: "running",
        version: "1.0.0",
        endpoints: {
          POST: "/feedback - 提交反馈"
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // POST请求 - 接收反馈
    if (request.method === 'POST') {
      try {
        const data = await request.json();
        
        // 验证必要字段
        if (!data.content) {
          return new Response(JSON.stringify({ error: 'Missing content' }), { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // 生成唯一ID（时间戳+随机数）
        const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // 存储到KV
        await env.FEEDBACK_KV.put(id, JSON.stringify({
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
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: error.message 
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // 其他方法
    return new Response('Method not allowed', { status: 405 });
  }
};