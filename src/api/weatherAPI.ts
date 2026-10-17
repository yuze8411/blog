export const config = {
  runtime: 'edge',
}

export default async function handler(req: Request) {
  const origin = req.headers.get('origin') ?? ''
  const allowList = ['http://localhost:3000', 'https://blog-rho-gules.vercel.app']
  const allowOrigin = allowList.includes(origin) ? origin : allowList[1]

  // CORS 预检 OPTIONS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': allowOrigin,
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }

  if (req.method !== 'GET') {
    return Response.json({ msg: '仅支持GET请求' }, { status: 405 })
  }

  const url = new URL(req.url)
  const latitude = url.searchParams.get('lat')
  const longitude = url.searchParams.get('lon')
  const key = process.env.QWEATHER_KEY //

  if (!latitude || !longitude || !key) {
    return Response.json({ msg: '参数或者密钥缺失' }, { status: 400 })
  }

  try {
    const targetUrl = `https://abcxyz.qweatherapi.com/weather/v1/current/${latitude}/${longitude}`
    const res = await fetch(targetUrl, {
      headers: {
        'X-QW-Api-Key': key,
      },
    })

    const data = await res.json()
    return Response.json(data, {
      status: res.status,
      headers: {
        'Access-Control-Allow-Origin': allowOrigin,
      },
    })
  } catch (err) {
    console.error('和风接口请求失败：', err)
    return Response.json({ msg: '请求天气服务异常' }, { status: 502 })
  }
}
