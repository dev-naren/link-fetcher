import Link from 'next/link'
import dbConnect from '../utils/dbConnect'
import site from '../models/site'
import { useState, useEffect } from 'react'
import axios from 'axios'
import LazyLoad from 'react-lazyload'
import { data } from 'browserslist'
// import ReactJson from 'react-json-view'
function validURL(str) {
  var pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i'
  ) // fragment locator
  return !!pattern.test(str)
}
const UrlContent = ({ url }) => {
  const [contentMessage, setContentMessage] = useState('Fetching data')
  const [content, setContent] = useState({})
  useEffect(() => {
    getData(url)
  }, [])
  const getData = async (input) => {
    try {
      setContentMessage('Fetching')
      let request = await axios.post('/api/site/siteContent', {
        url: input,
      })
      console.log(request)
      if (request && request.data && request.data.success) {
        let data = request.data.data
        // setContent(data)

        let out = {
          'content-length': data['content-length'],
          'content-type': data['content-type'],
          date: data.date,
          server: data.server,
        }
        setContent(out)
        setContentMessage('Success')
      } else {
        console.log('failer')
        setContentMessage('Failed')
      }
    } catch (ex) {
      console.log('failed')
      setContent('Failed')
    }
  }
  return (
    <>
      <>
        {contentMessage === 'Success' && (
          <ul>
            {' '}
            <li>Content-Type: {content['content-type']}</li>
            <li>content-length :{content['content-length']}</li>
            <li>date: {content.date}</li>
            <li>Server:{content.server}</li>
          </ul>
        )}
      </>
      <>{contentMessage === 'Failed' && 'Request Failed'} </>
      <>{contentMessage === 'Fetching' && 'Fetching...'}</>{' '}
    </>
  )
}

const Index = () => {
  const [message, setMessage] = useState('')
  const [siteUrl, setUrl] = useState('https://www.leadsquared.com')
  const [sites, setSites] = useState([])
  const [siteContent, setSiteContent] = useState(null)
  const [loader, setLoader] = useState(false)
  const fetchWebsite = async () => {
    try {
      let url = siteUrl
      if (url.substring(0, 8) != 'https://') {
        url = 'https://' + siteUrl
      }
      if (!validURL(url)) {
        alert('invalid url')
        return
      }
      setLoader(true)
      axios
        .post('/api/site', {
          url: url,
        })
        .then(function (response) {
          setLoader(false)
          console.log(response.data)
          setSites(response.data.data)
        })
        .catch(function (error) {
          setLoader(false)
          console.log(error)
        })
    } catch (error) {
      // setMessage('Failed to fetch the site.')
    }
  }

  return (
    <>
      <div class="pt-2 relative mx-auto text-gray-600 text-center">
        <input
          class="border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none mr-4"
          type="search"
          name="search"
          placeholder="Search Sites"
          required="true"
          value={siteUrl}
          onChange={(e) => setUrl(e.target.value)}
          style={{ width: '380px' }}
        />
        <button
          type="submit"
          class="py-2 px-4 font-semibold rounded-lg shadow-md text-white bg-green-500 hover:bg-green-700"
          onClick={fetchWebsite}
          disabled={loader}
        >
          {loader && <span className="animate-spin"> ....</span>}
          Submit
        </button>
      </div>
      <div className="pt-2 relative mx-auto text-gray-600 text-center border-separate cursor-pointer">
        Count: {sites.length}
        <table className="text-sm table-auto border-separate">
          <thead>
            <tr>
              <th className="w-1/2 ...">Url</th>
              <th className="w-1/4 ...">Content</th>
              <th className="w-1/4 ...">Data</th>
              <th className="w-1/4 ...">Selection</th>
            </tr>
          </thead>
          <tbody className="bg-blue-200 border-separate">
            {sites &&
              sites.length > 0 &&
              sites.map((i) => {
                return (
                  <tr key={i.id}>
                    <td>{i.href}</td>
                    <td dangerouslySetInnerHTML={{ __html: i.val }}></td>
                    <td>
                      <LazyLoad height={200} once>
                        <UrlContent url={i.href}></UrlContent>
                      </LazyLoad>
                    </td>
                    <td>
                      <input type="checkbox"></input>
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>
    </>
  )
}

/* Retrieves pet(s) data from mongodb database */
export async function getServerSideProps() {
  return { props: { pets: null } }
}

export default Index
