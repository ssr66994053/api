import { Router, json } from 'itty-router';

const router = Router({ base: '/kv' })

router.get('/:key?', async (request, env) => {
    const params = request.params;
    if (params.key) {
        const value = await env.kv.getWithMetadata(params.key);

        return json(value)
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

    return json(value)
})

router.post('/:key', async (request, env) => {
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

	return json({"success": true});
});

router.delete('/:key', async (request, env) => {
    const params = request.params;
    console.log(params);
    if (params.key) {
        await env.kv.delete(params.key);
    }

	return json({"success": true});
});

// 404 for everything else
router.all('*', () => new Response('Not Found.', { status: 404 }));

export default router;