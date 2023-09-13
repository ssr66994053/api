import { createCors, error, json, Router } from 'itty-router';

const { preflight, corsify } = createCors({
  headers: {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': 'GET,PATCH,POST,DELETE,OPTIONS',
    },
})

const router = Router({base: "/kv"})

router
    .all('*', preflight)
    .get('/:key?', async (request, env) => {
        const params = request.params;
        if (params.key) {
            const value = await env.kv.getWithMetadata(params.key);

            return value;
        }

        const query = request.query;
        const qryObj = {};
        if (query.prefix) {
            qryObj.prefix = query.prefix;
        }
        if (query.limit) {
            qryObj.limit = query.limit;
        }
        if (query.cursor) {
            qryObj.cursor = query.cursor;
        }
        const value = await env.kv.list(qryObj);

        return value;
    })
    .post('/:key', async (request, env) => {
        const content = await request.json();
        const params = request.params;
        const meta = request.query;
        const timeout = meta.timeout;
        delete meta.timeout;
        const obj = {
            metadata: meta
        }
        if (timeout) {
            obj.expirationTtl = timeout;
        }
    
        await env.kv.put(params.key, JSON.stringify(content), obj);
    
        return {"success": true};
    })
    .delete('/:key', async (request, env) => {
        const params = request.params;
        if (params.key) {
            await env.kv.delete(params.key);
        }
        return {"success": true};
    })
    .all('*', () => error(404));

export default {
  fetch: (req, ...args) => router
                            .handle(req, ...args)
                            .then(json)
                            .catch(error)
                            .then(corsify)
}