import dbConnect from '../../../utils/dbConnect'
import site from '../../../models/site'
import axios from 'axios'
import Cors from 'cors'
const cheerio = require('cheerio')
const cors = Cors({
  methods: ['GET', 'HEAD', 'POST'],
})
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}

export default async function handler(req, res) {
  const { method } = req
  await runMiddleware(req, res, cors)
  //  await dbConnect()

  switch (method) {
    case 'HEAD':
      try {
        let data = await getHead(req.body)
        res.status(200).json({ success: true, data })
      } catch (error) {
        console.log(error)
        res.status(400).json({ success: false })
      }
      break
    case 'POST':
      try {
        let data = await crawler(req.body)
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
  console.log(data)
  return data.data
}
const crawler = async (body) => {
  let data = await axios.get(body.url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.167 Safari/537.36',
    },
  })

  const $ = cheerio.load(data.data)
  let urls = []
  let urlMap = {}
  let anchors = $('body').find('a')
  console.log(anchors)
  anchors.each(async (index, elm) => {
    let c = {
      href: $(elm).attr('href'),
      val: $(elm).text(),
      id: index,
      selected: true,
    }
    //url validation and check if its relative or absolute
    if (c.href && c.href.substring(0, 1) === '/') {
      c.href = body.url + c.href
      urls.push(c)
    } else if (c.href && c.href.substring(0, 8) == 'https://') {
      urls.push(c)
    }
  })
  return urls || []
}
