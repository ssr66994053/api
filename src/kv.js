import { Router } from 'itty-router';

const router = Router();

router.get('/api/kv/:key?', async ({ params, query }) => {
    if (params.key) {
        const value = NAMESPACE.getWithMetadata(key);

        return json(value)
    }

    const value = await env.kv.list({ prefix: `${query.prefix}`, cursor: `${query.cursor}`});

    return json(value)
})

router.post('/api/kv/:key', async (request) => {
	const content = request.json();
    const params = request.params;
    const meta = request.query;

    await env.kv.put(params.key, content, {
        metadata: meta,
        expirationTtl: meta.timeout,
    });

	return json({"success": true});
});

// 404 for everything else
router.all('*', () => new Response('Not Found.', { status: 404 }));

export default router;