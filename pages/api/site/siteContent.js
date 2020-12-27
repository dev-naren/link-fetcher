import axios from 'axios'
import Cors from 'cors'
const cors = Cors({
  methods: ['GET', 'HEAD', 'POST'],
})
export default async function handler(req, res) {
  const { method } = req
  //await runMiddleware(req, res, cors)
  //  await dbConnect()

  switch (method) {
    case 'POST':
      try {
        let data = await getHead(req.body)
        res.status(200).json({ success: true, data })
      } catch (error) {
        console.log(error)
        res.status(400).json({ success: false })
      }
      break
    default:
      res.status(400).json({ success: false })
      break
  }
}
const getHead = async (body) => {
  let data = await axios.head(body.url, {
    headers: {
      Accept: 'text/html',
      'User-Agent':
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.167 Safari/537.36',
    },
  })

  return data.headers
}
