const CacheSite = JSON.parse(localStorage.getItem('site') || '{}');
const CacheCompany = JSON.parse(localStorage.getItem('company') || '{}');
const CacheUser = JSON.parse(localStorage.getItem('user') || '{}');
const CacheRoles = JSON.parse(localStorage.getItem('role') || '{}');
const CacheRole = Array.isArray(CacheRoles) ? CacheRoles[0] : {}
export { CacheSite, CacheUser, CacheCompany, CacheRole };
