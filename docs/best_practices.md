# Najlepsze praktyki programistyczne dla aplikacji RODO

## Podstawowe zasady RODO w programowaniu

### Zrozumienie podstawowych pojęć
- **Dane osobowe** - wszelkie informacje dotyczące zidentyfikowanej lub możliwej do zidentyfikowania osoby fizycznej
- **Przetwarzanie danych** - wszelkie operacje na danych osobowych (gromadzenie, zapisywanie, przekazywanie, modyfikowanie, rozpowszechnianie itp.)
- **Anonimizacja** - proces nieodwracalnego uniemożliwienia identyfikacji osób
- **Pseudonimizacja** - proces zastąpienia danych bezpośrednio identyfikujących danymi pośrednio identyfikującymi

### Planowanie zgodne z Privacy by Design
- Umieszczenie ochrony prywatności w centrum działań (Privacy by Design)
- Włączenie bezpieczeństwa do głównego nurtu procesu rozwoju
- Rozważenie ustawień prywatności, szczególnie ustawień domyślnych
- Przeprowadzenie oceny skutków dla ochrony danych (DPIA) w przypadku wysokiego ryzyka

## Architektura i funkcje aplikacji

### Uwzględnienie ochrony danych w architekturze
- Wpływ wymagań dotyczących ochrony danych na wybór architektury
- Domyślne ustawienia aplikacji muszą spełniać minimalne wymagania bezpieczeństwa

### Zachowanie kontroli nad systemem
- Utrzymanie prostego systemu dla lepszego zrozumienia jego działania
- Stopniowe zwiększanie złożoności systemu z zabezpieczaniem nowo dodawanych funkcji

### Nie poleganie na jednej linii obrony
- Stosowanie głębokiej obrony systemu
- Implementacja wielu warstw zabezpieczeń

## Narzędzia i praktyki programistyczne

### Standardy programowania uwzględniające bezpieczeństwo
- Stosowanie list standardów, najlepszych praktyk i przewodników kodowania
- Integracja narzędzi pomocniczych w IDE do automatycznego sprawdzania zgodności kodu
- Korzystanie z przewodników CERT dla C, C++ lub Javy
- Korzystanie z przewodników OWASP dla aplikacji internetowych

### Wybór technologii
- Wybór odpowiedniego języka programowania i technologii do konkretnych zadań
- Preferowanie języków i technologii sprawdzonych w czasie
- Używanie najnowszych wersji oprogramowania
- Unikanie kodowania w języku, którego się dopiero uczymy

## Zabezpieczenie środowiska programistycznego

### Bezpieczeństwo serwerów i stacji roboczych
- Priorytetowe traktowanie bezpieczeństwa serwerów produkcyjnych, deweloperskich i stacji roboczych

### Ocena ryzyka i odpowiednie środki bezpieczeństwa
- Ocena ryzyka związanego z narzędziami i procesami
- Inwentaryzacja istniejących środków bezpieczeństwa
- Opracowanie planu działania dla poprawy zabezpieczeń
- Rozważenie ryzyka związanego z narzędziami SaaS i narzędziami do współpracy w chmurze

### Zabezpieczanie serwerów i stacji roboczych
- Tworzenie dokumentu z listą środków bezpieczeństwa
- Stosowanie narzędzi do zarządzania konfiguracją (Ansible, Puppet, Chef)
- Regularne aktualizowanie serwerów i stacji roboczych
- Monitorowanie luk w zabezpieczeniach

## Bezpieczne praktyki kodowania

### Zarządzanie użytkownikami
- Korzystanie z unikalnych i indywidualnych identyfikatorów
- Wdrożenie odpowiedniego mechanizmu uwierzytelniania
- Implementacja bezpiecznego mechanizmu zarządzania zapomnianymi hasłami
- Przechowywanie haseł w formie zaszyfrowanej lub zhaszowanej

### Kontrola dostępu do danych
- Definiowanie profili użytkowników i przypisywanie im praw dostępu
- Wdrożenie mechanizmu filtrowania dostępu do zasobów, danych i funkcji
- Implementacja mechanizmu zarządzania sesjami użytkowników

### Bezpieczne zarządzanie danymi
- Szyfrowanie danych wrażliwych podczas przechowywania i transmisji
- Regularne tworzenie kopii zapasowych danych i testowanie procedur odzyskiwania
- Wdrożenie mechanizmów wykrywania i zapobiegania wyciekowi danych

### Bezpieczne programowanie
- Walidacja wszystkich danych wejściowych
- Stosowanie parametryzowanych zapytań do baz danych
- Implementacja mechanizmów logowania i monitorowania
- Stosowanie zasady najmniejszych uprawnień w kodzie

### Testowanie bezpieczeństwa
- Regularne przeprowadzanie testów bezpieczeństwa
- Wdrożenie procesu zarządzania podatnościami

## Praktyki związane z danymi osobowymi

### Minimalizacja danych
- Gromadzenie tylko niezbędnych danych
- Ograniczenie dostępu do danych osobowych
- Usuwanie niepotrzebnych danych

### Anonimizacja i pseudonimizacja
- Nieodwracalne uniemożliwienie identyfikacji przy anonimizacji
- Oddzielne przechowywanie "dodatkowych informacji" przy pseudonimizacji
- Zabezpieczenie "dodatkowych informacji" odpowiednimi środkami

### Zarządzanie zgodami i prawami osób
- Wdrożenie mechanizmów uzyskiwania i zarządzania zgodami
- Umożliwienie osobom korzystania z ich praw (dostęp, sprostowanie, usunięcie, itd.)
- Dokumentowanie wszystkich decyzji i działań związanych z przetwarzaniem danych osobowych
