import request from '@/utils/request';

export async function query() {
  return request('/api/users');
}

export async function queryCurrent() {
  return request('/gateway-u', {
    method: 'POST',
    body: JSON.stringify({ name: 222 }),
  });
}
