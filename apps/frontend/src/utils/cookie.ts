const getCookie = (name: string): string | null => {
  const cookieString = document.cookie;
  const cookies = cookieString.split('; ');
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split('=');
    if (cookieName === name) {
      return cookieValue;
    }
  }
  return null;
};
  
  export default getCookie;