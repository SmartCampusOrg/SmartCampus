/**
 * server/wuAuth.js
 * Moduł do autoryzacji z uczelnianym CAS (Central Authentication Service)
 * i pobierania harmonogramu z Wirtualnej Uczelni (PANSIM).
 */

export async function authenticateAndFetchWu({ username, password, ids = [221, 222, 224, 225, 226] }) {
  if (!username || !password) {
    throw new Error("Wymagany jest numer albumu oraz hasło.");
  }

  const serviceUrl = 'https://wu.pansim.edu.pl/wsrest/j_spring_cas_security_check';
  const loginUrl = 'https://wu.pansim.edu.pl/cas/login?service=' + encodeURIComponent(serviceUrl);

  // 1. Pobierz stronę logowania CAS i wyciągnij tokeny formularza (lt, execution, action)
  const res1 = await fetch(loginUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });

  const cookies1 = res1.headers.getSetCookie ? res1.headers.getSetCookie() : [res1.headers.get('set-cookie')];
  const html = await res1.text();

  const ltMatch = html.match(/name="lt"\s+value="([^"]+)"/);
  const execMatch = html.match(/name="execution"\s+value="([^"]+)"/);
  const actionMatch = html.match(/action="([^"]+)"/);

  if (!ltMatch) {
    throw new Error("Nie udało się pobrać formularza logowania z CAS uczelni.");
  }

  const postUrl = actionMatch ? ('https://wu.pansim.edu.pl' + actionMatch[1]) : loginUrl;
  const cookieHeader1 = (cookies1 || []).filter(Boolean).map(c => c.split(';')[0]).join('; ');

  const formParams = new URLSearchParams({
    username: String(username).trim(),
    password: String(password),
    lt: ltMatch[1],
    execution: execMatch ? execMatch[1] : 'e1s1',
    _eventId: 'submit',
    submit: 'Zaloguj'
  });

  // 2. Wyślij formularz logowania (POST)
  const res2 = await fetch(postUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': cookieHeader1,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
    body: formParams.toString(),
    redirect: 'manual'
  });

  // W systemie CAS pomyślne logowanie ZAWSZE zwraca przekierowanie 302 z biletem ST-...
  if (res2.status !== 302) {
    const errorHtml = await res2.text();
    if (errorHtml.includes("nieprawidłowe") || errorHtml.includes("errors") || errorHtml.includes("Błędny")) {
      throw new Error("Wpisany numer albumu lub hasło do Wirtualnej Uczelni jest nieprawidłowe.");
    }
    throw new Error(`Logowanie odrzucone przez uczelnię (kod HTTP ${res2.status}).`);
  }

  const securityCheckUrl = res2.headers.get('location');
  if (!securityCheckUrl) {
    throw new Error("Brak adresu weryfikacji biletu po zalogowaniu.");
  }

  // 3. Wymień bilet Service Ticket (ST) na aktywną sesję w module wsrest
  const res3 = await fetch(securityCheckUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
    redirect: 'manual'
  });

  const cookies3 = res3.headers.getSetCookie ? res3.headers.getSetCookie() : [res3.headers.get('set-cookie')];
  const wsrestCookie = (cookies3 || []).filter(Boolean).find(c => c.startsWith('JSESSIONID=')) 
    || (cookies3 || [])[0];

  if (!wsrestCookie) {
    throw new Error("Nie udało się uzyskać sesji w Wirtualnej Uczelni (brak ciasteczka JSESSIONID).");
  }

  const cleanCookie = wsrestCookie.split(';')[0];

  // 4. Pobierz harmonogram dla poszczególnych jednostek
  const allResults = [];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const acadStart = currentMonth >= 10 ? currentYear : currentYear - 1;
  const dataOd = `${acadStart}-10-01T00:00:00`;
  const dataDo = `${acadStart + 1}-09-30T00:00:00`;

  for (const id of ids) {
    try {
      const url = `https://wu.pansim.edu.pl/wsrest/rest/phz/harmonogram/zajecia?_dc=${Date.now()}&idGrupa=0&idNauczyciel=0&idJednostkaPanelJednostka=${id}&dataOd=${encodeURIComponent(dataOd)}&dataDo=${encodeURIComponent(dataDo)}&widok=JEDNOSTKA&authUzytkownikId=0&page=1&start=0&limit=100000`;
      
      const res = await fetch(url, {
        headers: {
          'Cookie': cleanCookie,
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      if (!res.ok) {
        console.warn(`Błąd pobierania jednostki ${id}: status HTTP ${res.status}`);
        continue;
      }

      const json = await res.json();
      if (json && json.status === "SUCCESS" && Array.isArray(json.result)) {
        allResults.push(...json.result);
      }
    } catch (e) {
      console.warn(`Wyjątek podczas pobierania jednostki ${id}:`, e);
    }
  }

  if (allResults.length === 0) {
    throw new Error("Zalogowano pomyślnie, ale serwer uczelni nie zwrócił żadnych zajęć dla wskazanych jednostek.");
  }

  return allResults;
}

