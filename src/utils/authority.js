// use localStorage to store the authority info, which might be sent from server in actual project.
export function getAuthority(str) {
  // return localStorage.getItem('antd-pro-authority') || ['admin', 'user'];
  const authorityString = typeof str === 'undefined' ? localStorage.getItem('role') : str;
  // authorityString could be admin, "admin", ["admin"]
  let authority;
  try {
    authority = JSON.parse(authorityString);
    authority = authority.map(item => item.role_value);
  } catch (e) {
    authority = authorityString;
  }
  if (typeof authority === 'string') {
    return [authority];
  }
  return authority || ['admin'];
}

export function setAuthority(loginData) {
  // TODO: 登录后，同时获取当前用户的角色，用于权限控制
  localStorage.setItem('role', JSON.stringify(loginData.roles || []));
  localStorage.setItem('user', JSON.stringify(loginData.user || {}));
  localStorage.setItem('site', JSON.stringify(loginData.site || {}));
  localStorage.setItem('company', JSON.stringify(loginData.company || {}));
  return localStorage.setItem('token', loginData.token || '');
}
