import request from '@/utils/request';

export async function query() {
  return request('/api/users');
}

export async function queryCurrent() {
  return request('https://tp-pay.snssdk.com/gateway-u', {
    method: 'POST',
    body: JSON.stringify({ name: 222 }),
  });
}
