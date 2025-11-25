import '@testing-library/jest-dom'
import 'whatwg-fetch'
import { TextEncoder, TextDecoder } from 'util'

Object.assign(global, { TextDecoder, TextEncoder })

if (!Response.json) {
    // @ts-ignore
    Response.json = function (data: any, init?: ResponseInit) {
        return new Response(JSON.stringify(data), {
            ...init,
            headers: {
                'Content-Type': 'application/json',
                ...init?.headers,
            },
        });
    };
}
