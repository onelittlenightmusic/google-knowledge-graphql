import { GraphQLServer } from 'graphql-yoga'
import fetch from 'node-fetch'
import { config } from 'dotenv'
config()

const API_URL = "https://kgsearch.googleapis.com/v1/entities:search"
const API_KEY = process.env.API_KEY
const PORT = process.env.PORT

var download = async function(url: string) {
  var response = await fetch(url);
  var rtn = (await response.json())['itemListElement']
  return rtn
}

const knowledge =  async (name: string) => {
  var encodedName = encodeURIComponent(name)
  return await download(`${API_URL}?query=${encodedName}&key=${API_KEY}`)
}

async function run() {
	const typeDefs = 'schema.graphql';

  const resolvers = {
    Query: {
      knowledge: async (obj:any, param:any, context: any, info: any) => { return await knowledge(param.name)}
    },
    Knowledge: {
      name: (item: any) => item.result.name,
      description: (item: any) => item.result.description,
      details: (item: any) => item.result.detailedDescription.articleBody,
      score: (item: any) => item.resultScore,
    }
  };

  const formatResponse = (response:any) => {
    var meta = {
      data_origin: "Data provided for free by IEX. View IEX’s Terms of Use",
      source_url: "https://iextrading.com/developer",
      lisence_type: "IEX’s Terms of Use: https://iextrading.com/api-exhibit-a"
    }
    return {
      ...response,
      meta
    }
  }
	const server = new GraphQLServer({ typeDefs, resolvers })
	server.start({port: PORT, formatResponse}, () =>
		console.log(`Your GraphQL server is running now ...`),
	)
}

try {
	run()
} catch(e) {
	console.log(e)
}
