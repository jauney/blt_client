const CacheSite = JSON.parse(localStorage.getItem('site') || '{}');
const CacheCompany = JSON.parse(localStorage.getItem('company') || '{}');
const CacheUser = JSON.parse(localStorage.getItem('user') || '{}');
const CacheRole = JSON.parse(localStorage.getItem('role') || '{}');
export { CacheSite, CacheUser, CacheCompany, CacheRole };
