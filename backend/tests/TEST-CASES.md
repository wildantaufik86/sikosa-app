# SIKOSA - Test Case Documentation

## Domains
- [Auth](#auth)
- [User](#user)
- [Consultation](#consultation)
- [Chat](#chat)
- [Article](#article)
- [Chatbot](#chatbot)

---

## Auth

### Login

#### Unit Tests - Login Service

| ID | Scenario | Precondition | Steps | Expected Result | Type | Priority |
|---|---|---|---|---|---|---|
| TC-LOGIN-01 | Email kosong | Mock user tidak diperlukan | Call `loginUser()` dengan email `""` | Throws 400 + "Email is required" + `InvalidPayload` | Unit | High |
| TC-LOGIN-02 | Password kosong | Mock user tidak diperlukan | Call `loginUser()` dengan password `""` | Throws 400 + "Password is required" + `InvalidPayload` | Unit | High |
| TC-LOGIN-03 | Format email tidak valid | Mock user tidak diperlukan | Call `loginUser()` dengan email `"usergmail.com"` | Throws 400 + "Invalid email format" + `InvalidPayload` | Unit | High |
| TC-LOGIN-04 | Email tidak terdaftar | `UserModel.findOne` returns null | Call `loginUser()` dengan email valid tidak terdaftar | Throws 404 + "User not found" + `UserNotFound` | Unit | High |
| TC-LOGIN-05 | Password salah | User ditemukan, `comparePassword` returns false | Call `loginUser()` dengan password salah | Throws 401 + "Invalid Email or Password" + `InvalidUser` | Unit | High |
| TC-LOGIN-09 | Email dan password kosong | Mock user tidak diperlukan | Call `loginUser()` dengan email dan password `""` | Throws 400 + "Email and password are required" + `InvalidPayload` | Unit | Medium |
| TC-LOGIN-10 | User belum verifikasi | User exists dengan `verified: false`, `comparePassword` returns true | Call `loginUser()` dengan kredensial valid | Returns object dengan `accessToken`, `refreshToken`, `user` | Unit | High |
| TC-LOGIN-06 | Login valid | User exists dan `comparePassword` returns true | Call `loginUser()` dengan email dan password benar | Returns object dengan `accessToken`, `refreshToken`, `user` | Unit | High |
| TC-LOGIN-07 | Email uppercase | User exists dan `comparePassword` returns true | Call `loginUser()` dengan email `"USER@GMAIL.COM"` | Returns object dengan `accessToken` dan `refreshToken` (case-insensitive) | Unit | Medium |
| TC-LOGIN-08 | Email dengan spasi | User exists dan `comparePassword` returns true | Call `loginUser()` dengan email `" user@gmail.com "` | Returns object dengan `accessToken` (trim handled) | Unit | Low |

#### Integration Tests - Login API

| ID | Scenario | Precondition | Steps | Expected Result | Type | Priority |
|---|---|---|---|---|---|---|
| TC-INT-LOGIN-001 | Body kosong | DB bersih, 3 user ter-seed | `POST /api/auth/login` dengan body `{}` | HTTP 400 + array `errors` tidak kosong | Integration | High |
| TC-INT-LOGIN-002 | Email tidak dikirim | DB bersih, 3 user ter-seed | `POST /api/auth/login` dengan `{ password: "Valid123!" }` | HTTP 400 + `errors` mengandung path `"email"` | Integration | High |
| TC-INT-LOGIN-003 | Password tidak dikirim | DB bersih, 3 user ter-seed | `POST /api/auth/login` dengan `{ email: "test@mail.com" }` | HTTP 400 + `errors` mengandung path `"password"` | Integration | High |
| TC-INT-LOGIN-004 | Format email invalid | DB bersih, 3 user ter-seed | `POST /api/auth/login` dengan email `"invalid"` | HTTP 400 + pesan error mengandung "email" | Integration | High |
| TC-INT-LOGIN-005 | Password terlalu pendek | DB bersih, 3 user ter-seed | `POST /api/auth/login` dengan password `"123"` | HTTP 400 + pesan error mengandung "at least" | Integration | Medium |
| TC-INT-LOGIN-006 | Email terlalu panjang | DB bersih, 3 user ter-seed | `POST /api/auth/login` dengan email 269 karakter | HTTP 400 | Integration | Low |
| TC-INT-LOGIN-007 | User tidak ditemukan | DB bersih, 3 user ter-seed | `POST /api/auth/login` dengan email tidak terdaftar | HTTP 404 + message "User not found" | Integration | High |
| TC-INT-LOGIN-008 | Password salah | User mahasiswa ada di DB | `POST /api/auth/login` dengan password salah | HTTP 401 + message "Invalid Email or Password" | Integration | High |
| TC-INT-LOGIN-009 | Email dengan spasi | User mahasiswa ada di DB | `POST /api/auth/login` dengan email mengandung spasi | HTTP 200 + `data.user.email` sama dengan email user | Integration | Medium |
| TC-INT-LOGIN-010 | Password dengan spasi | User mahasiswa ada di DB | `POST /api/auth/login` dengan password mengandung spasi | HTTP 200 | Integration | Low |
| TC-INT-LOGIN-011 | Login mahasiswa valid | User role mahasiswa ada di DB | `POST /api/auth/login` dengan kredensial mahasiswa | HTTP 200 + `data.user.role` = "mahasiswa" | Integration | High |
| TC-INT-LOGIN-012 | Login psikolog valid | User role psikolog ada di DB | `POST /api/auth/login` dengan kredensial psikolog | HTTP 200 + `data.user.role` = "psikolog" | Integration | High |
| TC-INT-LOGIN-013 | Login admin valid | User role admin ada di DB | `POST /api/auth/login` dengan kredensial admin | HTTP 200 + `data.user.role` = "admin" | Integration | High |
| TC-INT-LOGIN-014 | User belum verified tetap bisa login | User dengan `verified: false` ada di DB | `POST /api/auth/login` dengan kredensial mahasiswa | HTTP 200 + `data.user.verified` = false | Integration | High |
| TC-INT-LOGIN-015 | accessToken ada di response | User admin ada di DB | `POST /api/auth/login` dengan kredensial admin | `res.body.accessToken` defined dan bertipe string | Integration | High |
| TC-INT-LOGIN-016 | refreshToken ada di response | User admin ada di DB | `POST /api/auth/login` dengan kredensial admin | `res.body.refreshToken` defined | Integration | High |
| TC-INT-LOGIN-017 | Cookie accessToken terset | User admin ada di DB | `POST /api/auth/login` dengan kredensial admin | Cookie response mengandung `accessToken` | Integration | High |
| TC-INT-LOGIN-018 | Cookie refreshToken terset | User admin ada di DB | `POST /api/auth/login` dengan kredensial admin | Cookie response mengandung `refreshToken` | Integration | High |
| TC-INT-LOGIN-019 | Session tersimpan di DB | User admin ada di DB | `POST /api/auth/login` dengan kredensial admin | `SessionModel.find()` mengembalikan 1 session milik admin | Integration | High |
| TC-INT-LOGIN-020 | Multiple login buat multiple session | User admin ada di DB, session bersih | Login 2x dengan kredensial admin | DB mengandung 2 session untuk admin | Integration | Medium |
| TC-INT-LOGIN-021 | DB error saat find user | `UserModel.findOne` di-mock throw Error | `POST /api/auth/login` dengan email valid | HTTP 500 | Integration | Medium |
| TC-INT-LOGIN-022 | comparePassword error | `findOne` di-mock return user dengan `comparePassword` throw | `POST /api/auth/login` dengan email valid | HTTP 500 | Integration | Medium |
| TC-INT-LOGIN-023 | Session create error | `SessionModel.create` di-mock throw Error | `POST /api/auth/login` dengan kredensial admin | HTTP 500 | Integration | Medium |
| TC-INT-LOGIN-024 | Token error | `signToken` di-mock throw Error | `POST /api/auth/login` dengan kredensial admin | HTTP 500 | Integration | Medium |

---

### Register

#### Unit Tests - Register Service

| ID | Scenario | Precondition | Steps | Expected Result | Type | Priority |
|---|---|---|---|---|---|---|
| TC-AUTH-01 | Email kosong | Mocks siap, user tidak ada | Call `createAccount()` dengan email `""` | Throws 400 + "Email is required" + `InvalidPayload` | Unit | High |
| TC-AUTH-02 | Format email tidak valid | Mocks siap, user tidak ada | Call `createAccount()` dengan email `"usergmail.com"` | Throws 400 + "Invalid email format" + `InvalidPayload` | Unit | High |
| TC-AUTH-03 | Email valid | Mocks siap, user tidak ada | Call `createAccount()` dengan data lengkap valid | Returns object dengan `accessToken` | Unit | High |
| TC-AUTH-04 | Email sudah terdaftar | `UserModel.exists` returns true | Call `createAccount()` dengan email yang sudah ada | Throws 409 + "Email already exists" + `InvalidPayload` | Unit | High |
| TC-AUTH-05 | Email dengan spasi | Mocks siap, user tidak ada | Call `createAccount()` dengan email `"user @gmail.com"` | Throws 400 + "Invalid email format" + `InvalidPayload` | Unit | Medium |
| TC-AUTH-06 | NIM valid | Mocks siap, user tidak ada | Call `createAccount()` dengan nim `"12345678"` | Returns defined result | Unit | Medium |
| TC-AUTH-07 | NIM kosong (undefined) | Mocks siap, user tidak ada | Call `createAccount()` dengan `nim: undefined` | Returns defined result (nim opsional) | Unit | Medium |
| TC-AUTH-08 | NIM mengandung huruf | Mocks siap, user tidak ada | Call `createAccount()` dengan nim `"123ABC"` | Throws 400 + "NIM must be numeric" + `InvalidPayload` | Unit | Medium |
| TC-AUTH-09 | NIM terlalu pendek | Mocks siap, user tidak ada | Call `createAccount()` dengan nim `"123"` | Throws 400 + "NIM length is invalid" + `InvalidPayload` | Unit | Medium |
| TC-AUTH-10 | NIM terlalu panjang | Mocks siap, user tidak ada | Call `createAccount()` dengan nim 20 digit | Throws 400 + "NIM length is invalid" + `InvalidPayload` | Unit | Medium |
| TC-AUTH-11 | Password valid | Mocks siap, user tidak ada | Call `createAccount()` dengan password `"Password123!"` | Returns defined result | Unit | High |
| TC-AUTH-12 | Password kosong | Mocks siap, user tidak ada | Call `createAccount()` dengan password `""` | Throws 400 + "Password is required" + `InvalidPayload` | Unit | High |
| TC-AUTH-13 | Password terlalu pendek | Mocks siap, user tidak ada | Call `createAccount()` dengan password `"12345"` | Throws 400 + "Password too short" + `InvalidPayload` | Unit | High |
| TC-AUTH-14 | Password lemah (tanpa uppercase/angka/simbol) | Mocks siap, user tidak ada | Call `createAccount()` dengan password `"password"` | Throws 400 + "Password must contain uppercase, number, and symbol" + `InvalidPayload` | Unit | High |
| TC-AUTH-15 | Password terlalu panjang | Mocks siap, user tidak ada | Call `createAccount()` dengan password 60 karakter | Throws 400 + "Password too long" + `InvalidPayload` | Unit | Medium |
| TC-AUTH-16 | Fullname valid | Mocks siap, user tidak ada | Call `createAccount()` dengan fullname `"Muhammad Aidil"` | Returns defined result | Unit | High |
| TC-AUTH-17 | Fullname kosong | Mocks siap, user tidak ada | Call `createAccount()` dengan fullname `""` | Throws 400 + "Fullname is required" + `InvalidPayload` | Unit | High |
| TC-AUTH-18 | Fullname terlalu pendek | Mocks siap, user tidak ada | Call `createAccount()` dengan fullname `"A"` | Throws 400 + "Fullname too short" + `InvalidPayload` | Unit | Medium |
| TC-AUTH-19 | Fullname mengandung angka | Mocks siap, user tidak ada | Call `createAccount()` dengan fullname `"Aidil123"` | Throws 400 + "Fullname must contain only letters" + `InvalidPayload` | Unit | Medium |
| TC-AUTH-20 | Fullname terlalu panjang | Mocks siap, user tidak ada | Call `createAccount()` dengan fullname 100 karakter | Throws 400 + "Fullname too long" + `InvalidPayload` | Unit | Medium |
| TC-AUTH-21 | Picture URL valid | Mocks siap, user tidak ada | Call `createAccount()` dengan picture `"http://img.com/a.jpg"` | Returns defined result | Unit | Medium |
| TC-AUTH-22 | Picture kosong | Mocks siap, user tidak ada | Call `createAccount()` dengan picture `""` | Returns defined, `UserModel.create` dipanggil dengan `profile.picture: null` | Unit | Medium |
| TC-AUTH-23 | URL picture tidak valid | Mocks siap, user tidak ada | Call `createAccount()` dengan picture `"abc"` | Throws 400 + "Invalid URL format" + `InvalidPayload` | Unit | Medium |
| TC-AUTH-24 | URL picture bukan gambar | Mocks siap, user tidak ada | Call `createAccount()` dengan picture `"http://test.com/file.txt"` | Throws 400 + "Invalid image URL" + `InvalidPayload` | Unit | Medium |
| TC-AUTH-25 | URL picture terlalu panjang | Mocks siap, user tidak ada | Call `createAccount()` dengan picture URL 300+ karakter | Throws 400 + "URL too long" + `InvalidPayload` | Unit | Low |
| TC-AUTH-26 | Role mahasiswa | Mocks siap, user tidak ada | Call `createAccount()` dengan `role: "mahasiswa"` | Returns defined result | Unit | High |
| TC-AUTH-27 | Role psikolog dilarang | Mocks siap, user tidak ada | Call `createAccount()` dengan `role: "psikolog"` | Throws 403 + `REGISTER_ROLE_FORBIDDEN` | Unit | High |
| TC-AUTH-28 | Role admin dilarang | Mocks siap, user tidak ada | Call `createAccount()` dengan `role: "admin"` | Throws 403 + `REGISTER_ROLE_FORBIDDEN` | Unit | High |
| TC-AUTH-29 | Role tidak valid | Mocks siap, user tidak ada | Call `createAccount()` dengan `role: "guest"` | Throws 400 + "Invalid role" + `InvalidRole` | Unit | High |
| TC-AUTH-30 | Role kosong | Mocks siap, user tidak ada | Call `createAccount()` dengan `role: ""` | Throws 400 + "Role is required" + `InvalidPayload` | Unit | High |

#### Integration Tests - Register API

| ID | Scenario | Precondition | Steps | Expected Result | Type | Priority |
|---|---|---|---|---|---|---|
| TC-INT-REG-001 | Body kosong | DB bersih | `POST /api/auth/register` tanpa body | HTTP 400 + `message` ada | Integration | High |
| TC-INT-REG-002 | Email invalid | DB bersih | `POST /api/auth/register` dengan email `"invalid"` | HTTP 400 | Integration | High |
| TC-INT-REG-003 | Email kosong | DB bersih | `POST /api/auth/register` dengan email `""` | HTTP 400 | Integration | High |
| TC-INT-REG-004 | Password tidak cocok dengan confirmPassword | DB bersih | `POST /api/auth/register` dengan `confirmPassword: "wrong"` | HTTP 400 | Integration | High |
| TC-INT-REG-005 | Password kurang dari 6 karakter | DB bersih | `POST /api/auth/register` dengan password `"123"` | HTTP 400 | Integration | High |
| TC-INT-REG-006 | Role tidak valid | DB bersih | `POST /api/auth/register` dengan `role: "user"` | HTTP 400 | Integration | High |
| TC-INT-REG-007 | Tanpa role — default mahasiswa | DB bersih | `POST /api/auth/register` tanpa field role | HTTP 201 + `res.body.role` = "mahasiswa" | Integration | Medium |
| TC-INT-REG-008 | Register mahasiswa valid | DB bersih | `POST /api/auth/register` dengan payload lengkap valid | HTTP 201 + user tersimpan di DB | Integration | High |
| TC-INT-REG-009 | Register sebagai admin dilarang | DB bersih | `POST /api/auth/register` dengan `role: "admin"` | HTTP 403 | Integration | High |
| TC-INT-REG-010 | Register sebagai psikolog dilarang | DB bersih | `POST /api/auth/register` dengan `role: "psikolog"` | HTTP 403 | Integration | High |
| TC-INT-REG-011 | Email duplikat | User dengan email sama sudah ada | `POST /api/auth/register` dengan email yang sama | HTTP 409 | Integration | High |
| TC-INT-REG-012 | Email valid | DB bersih | `POST /api/auth/register` dengan email valid | HTTP 201 | Integration | High |
| TC-INT-REG-013 | Password tanpa uppercase | DB bersih | `POST /api/auth/register` dengan password `"password1!"` | HTTP 400 | Integration | High |
| TC-INT-REG-014 | Password tanpa angka | DB bersih | `POST /api/auth/register` dengan password `"Password!"` | HTTP 400 | Integration | High |
| TC-INT-REG-015 | Password tanpa simbol | DB bersih | `POST /api/auth/register` dengan password `"Password1"` | HTTP 400 | Integration | High |
| TC-INT-REG-016 | Password kurang dari 8 karakter (service validation) | DB bersih | `POST /api/auth/register` dengan password `"Pass1!"` | HTTP 400 | Integration | High |
| TC-INT-REG-017 | Password valid | DB bersih | `POST /api/auth/register` dengan password `"Password1!"` | HTTP 201 | Integration | High |
| TC-INT-REG-018 | Tanpa field profile | DB bersih | `POST /api/auth/register` tanpa field `profile` | HTTP 400 | Integration | High |
| TC-INT-REG-019 | Fullname kosong | DB bersih | `POST /api/auth/register` dengan `profile.fullname: ""` | HTTP 400 | Integration | High |
| TC-INT-REG-020 | Fullname mengandung angka | DB bersih | `POST /api/auth/register` dengan `profile.fullname: "123"` | HTTP 400 | Integration | Medium |
| TC-INT-REG-021 | Fullname terlalu pendek | DB bersih | `POST /api/auth/register` dengan fullname 1 karakter | HTTP 400 | Integration | Medium |
| TC-INT-REG-022 | Fullname terlalu panjang | DB bersih | `POST /api/auth/register` dengan fullname 60 karakter | HTTP 400 | Integration | Medium |
| TC-INT-REG-023 | Fullname valid | DB bersih | `POST /api/auth/register` dengan `profile.fullname: "Aidil"` | HTTP 201 | Integration | High |
| TC-INT-REG-024 | Tanpa picture — tetap berhasil | DB bersih | `POST /api/auth/register` tanpa field picture | HTTP 201 | Integration | Medium |
| TC-INT-REG-025 | Picture URL tidak valid | DB bersih | `POST /api/auth/register` dengan `picture: "abc"` | HTTP 400 | Integration | Medium |
| TC-INT-REG-026 | Picture bukan gambar | DB bersih | `POST /api/auth/register` dengan `picture: "file.pdf"` | HTTP 400 | Integration | Medium |
| TC-INT-REG-027 | Picture URL terlalu panjang | DB bersih | `POST /api/auth/register` dengan picture URL 300+ karakter | HTTP 400 | Integration | Low |
| TC-INT-REG-028 | Picture URL valid | DB bersih | `POST /api/auth/register` dengan `picture: "http://image.com/a.jpg"` | HTTP 201 | Integration | Medium |
| TC-INT-REG-029 | NIM valid | DB bersih | `POST /api/auth/register` dengan `nim: "12345678"` | HTTP 201 | Integration | Medium |
| TC-INT-REG-030 | NIM non-numerik | DB bersih | `POST /api/auth/register` dengan `nim: "ABC"` | HTTP 400 | Integration | Medium |
| TC-INT-REG-031 | NIM terlalu pendek | DB bersih | `POST /api/auth/register` dengan `nim: "123"` | HTTP 400 | Integration | Medium |
| TC-INT-REG-032 | NIM terlalu panjang | DB bersih | `POST /api/auth/register` dengan nim 20 digit | HTTP 400 | Integration | Medium |
| TC-INT-REG-033 | NIM kosong — berhasil (opsional) | DB bersih | `POST /api/auth/register` dengan `nim: ""` | HTTP 201 | Integration | Low |
| TC-INT-REG-034 | User tersimpan di DB | DB bersih | `POST /api/auth/register` dengan payload valid | HTTP 201 + `UserModel.findOne()` mengembalikan user | Integration | High |
| TC-INT-REG-035 | Password di-hash di DB | DB bersih | `POST /api/auth/register` dengan payload valid | `user.password` tidak sama dengan password plain | Integration | High |
| TC-INT-REG-036 | Verification code dibuat | DB bersih | `POST /api/auth/register` dengan payload valid | `VerificationCodeModel.findOne()` mengembalikan kode | Integration | High |
| TC-INT-REG-037 | Session dibuat | DB bersih | `POST /api/auth/register` dengan payload valid | `SessionModel.findOne()` mengembalikan session | Integration | High |
| TC-INT-REG-038 | Cookie accessToken terset | DB bersih | `POST /api/auth/register` dengan payload valid | Cookie response mengandung `accessToken` | Integration | High |
| TC-INT-REG-039 | Cookie refreshToken terset | DB bersih | `POST /api/auth/register` dengan payload valid | Cookie response mengandung `refreshToken` | Integration | High |
| TC-INT-REG-040 | Email uppercase — berhasil | DB bersih | `POST /api/auth/register` dengan email `"TEST@MAIL.COM"` | HTTP 201 | Integration | Low |
| TC-INT-REG-041 | Fullname hanya spasi | DB bersih | `POST /api/auth/register` dengan `profile.fullname: "   "` | HTTP 400 | Integration | Medium |
| TC-INT-REG-042 | Race condition duplikat email | DB bersih | Kirim 2 request register dengan email sama secara bersamaan | Satu request 201, satu request 409 | Integration | Medium |
| TC-INT-REG-043 | Register sukses full assertion | DB bersih | `POST /api/auth/register` dengan payload valid | HTTP 201 + user, session, dan verification code tersimpan di DB | Integration | High |

---

### Logout

#### Unit Tests - Logout Service

| ID | Scenario | Precondition | Steps | Expected Result | Type | Priority |
|---|---|---|---|---|---|---|
| TC-LOGOUT-01 | Logout tanpa token | Tidak ada token | Call `logoutService()` dengan `accessToken: undefined` | Throws "Unauthorized" | Unit | High |
| TC-LOGOUT-02 | Token tidak valid | `verifyToken` di-mock throw Error | Call `logoutService()` dengan token sembarang | Throws `INVALID_TOKEN` | Unit | High |
| TC-LOGOUT-03 | Token expired | `verifyToken` di-mock throw `TokenExpiredError` | Call `logoutService()` dengan token expired | Throws `TOKEN_EXPIRED` | Unit | High |
| TC-LOGOUT-04 | Logout valid | `verifyToken` returns payload, session ditemukan dan terhapus | Call `logoutService()` dengan token valid | Returns `{ statusCode: 200, message: "Logout successful" }` + `findByIdAndDelete` dipanggil | Unit | High |
| TC-LOGOUT-05 | Logout berulang (session tidak ada) | `verifyToken` returns payload, session tidak ditemukan | Call `logoutService()` dengan token sudah pernah dipakai | Throws `INVALID_TOKEN` | Unit | High |

#### Integration Tests - Logout API

| ID | Scenario | Precondition | Steps | Expected Result | Type | Priority |
|---|---|---|---|---|---|---|
| TC-INT-LOGOUT-001 | Tanpa token | User ter-register dan login | `POST /api/auth/logout` tanpa header Authorization | HTTP 401 + message "Unauthorized" | Integration | High |
| TC-INT-LOGOUT-002 | Token format invalid | User ter-register dan login | `POST /api/auth/logout` dengan `Authorization: Bearer invalid` | HTTP 401 + message mengandung "Invalid token" | Integration | High |
| TC-INT-LOGOUT-003 | Token expired | User ter-register dan login | `POST /api/auth/logout` dengan token ber-expiry `-1s` | HTTP 401 + message = `TOKEN_EXPIRED` | Integration | High |
| TC-INT-LOGOUT-004 | Logout via header berhasil | Session aktif ada di DB | `POST /api/auth/logout` dengan `Authorization: Bearer {accessToken}` | HTTP 200 + "Logout successful" + session terhapus dari DB | Integration | High |
| TC-INT-LOGOUT-005 | Logout via cookie berhasil | Session aktif ada di DB | `POST /api/auth/logout` dengan cookie valid | HTTP 200 + "Logout successful" + session terhapus dari DB | Integration | High |
| TC-INT-LOGOUT-006 | Session tidak ada di DB | Session dihapus manual | `POST /api/auth/logout` dengan token valid tapi session tidak ada | HTTP 401 + message mengandung "Invalid token" | Integration | High |
| TC-INT-LOGOUT-007 | Logout menghapus session di DB | Session aktif ada | `POST /api/auth/logout` dengan token valid | `SessionModel.findById()` returns null setelah logout | Integration | High |
| TC-INT-LOGOUT-008 | Cookie dibersihkan setelah logout | Session aktif ada | `POST /api/auth/logout` via cookie | Set-Cookie header mengandung `accessToken` dan `refreshToken` (clear) | Integration | Medium |
| TC-INT-LOGOUT-009 | Logout dua kali berturut-turut | Session aktif ada | Logout 2x dengan token yang sama | Request kedua HTTP 401 | Integration | Medium |
| TC-INT-LOGOUT-010 | Token tanpa payload yang valid | Tidak ada session | `POST /api/auth/logout` dengan token `jwt.sign({})` | HTTP 401 | Integration | Medium |
| TC-INT-LOGOUT-011 | Token tanpa sessionId | Tidak ada session | `POST /api/auth/logout` dengan token `jwt.sign({ userId })` | HTTP 401 | Integration | Medium |
| TC-INT-LOGOUT-012 | Header tanpa prefix Bearer | Session aktif ada | `POST /api/auth/logout` dengan `Authorization: {token}` (tanpa "Bearer ") | HTTP 401 | Integration | Medium |
| TC-INT-LOGOUT-013 | User dihapus — logout tetap berhasil | Session aktif ada, user dihapus | `POST /api/auth/logout` dengan token valid | HTTP 200 | Integration | Low |
| TC-INT-LOGOUT-014 | Multiple session — hanya satu terhapus | Dua session aktif | Logout dengan token session pertama | Session pertama null, session kedua masih ada | Integration | Medium |
| TC-INT-LOGOUT-015 | Cookie dan header keduanya dikirim | Session aktif ada | `POST /api/auth/logout` dengan Authorization header + Cookie | HTTP 200 | Integration | Low |

---

## User

### Mahasiswa Profile

#### Unit Tests - User Mahasiswa Service

| ID | Scenario | Precondition | Steps | Expected Result | Type | Priority |
|---|---|---|---|---|---|---|
| TC-MHS-UP-01 | userId tidak diberikan | Mock siap | Call `updateUserProfile()` dengan `userId: undefined` | Throws "Invalid user" | Unit | High |
| TC-MHS-UP-02 | User tidak ditemukan | `UserModel.findById` returns null | Call `updateUserProfile()` dengan userId valid | Throws "User not found" | Unit | High |
| TC-MHS-UP-14 | Database error saat save | `findById` returns user, `save` throw Error | Call `updateUserProfile()` dengan `fullname: "Aidil"` | Throws "DB Error" | Unit | Medium |
| TC-MHS-UP-03 | Update fullname valid | User ditemukan di mock | Call `updateUserProfile()` dengan `fullname: "Aidil"` | `result.profile.fullname` = "Aidil" + `save` terpanggil | Unit | High |
| TC-MHS-UP-04 | Update nim valid | User ditemukan di mock | Call `updateUserProfile()` dengan `nim: "456"` | `result.nim` = "456" | Unit | High |
| TC-MHS-UP-05 | Update picture valid | User ditemukan di mock | Call `updateUserProfile()` dengan `picture: "new.jpg"` | `result.profile.picture` = "new.jpg" | Unit | High |
| TC-MHS-UP-06 | Update multiple field | User ditemukan di mock | Call `updateUserProfile()` dengan nim, fullname, dan picture | Semua field terupdate sesuai nilai baru | Unit | High |
| TC-MHS-UP-07 | Tidak ada field diupdate | User ditemukan di mock | Call `updateUserProfile()` hanya dengan userId | Data tetap sama seperti sebelumnya | Unit | Low |
| TC-MHS-UP-08 | Fullname kosong | User ditemukan di mock | Call `updateUserProfile()` dengan `fullname: ""` | `result.profile.fullname` tetap "Old Name" (tidak diubah) | Unit | Medium |
| TC-MHS-UP-09 | NIM kosong | User ditemukan di mock | Call `updateUserProfile()` dengan `nim: ""` | `result.nim` tetap "123" (tidak diubah) | Unit | Medium |
| TC-MHS-UP-10 | Picture kosong | User ditemukan di mock | Call `updateUserProfile()` dengan `picture: ""` | `result.profile.picture` tetap "old.jpg" (tidak diubah) | Unit | Medium |
| TC-MHS-UP-11 | Fullname whitespace | User ditemukan di mock | Call `updateUserProfile()` dengan `fullname: " Aidil "` | `result.profile.fullname` = " Aidil " (disimpan apa adanya) | Unit | Low |
| TC-MHS-UP-12 | Fullname mengandung emoji | User ditemukan di mock | Call `updateUserProfile()` dengan `fullname: "Aidil 😎"` | `result.profile.fullname` = "Aidil 😎" | Unit | Low |
| TC-MHS-UP-13 | Tipe data tidak sesuai | User ditemukan di mock | Call `updateUserProfile()` dengan `fullname: 123` (number) | `result.profile.fullname` = 123 (tetap diassign) | Unit | Low |
| TC-MHS-UP-15 | Concurrent update | User ditemukan di mock | Call `Promise.all([update A, update B])` | `save` terpanggil 2 kali | Unit | Low |

#### Integration Tests - User Mahasiswa API

| ID | Scenario | Precondition | Steps | Expected Result | Type | Priority |
|---|---|---|---|---|---|---|
| TC-INT-UP-001 | Update fullname | User mahasiswa ter-create, token valid | `PUT /api/user/profile` dengan `{ fullname: "New Name" }` | HTTP 200 + `user.profile.fullname` = "New Name" di DB | Integration | High |
| TC-INT-UP-002 | Update nim | User mahasiswa ter-create, token valid | `PUT /api/user/profile` dengan `{ nim: "12345678" }` | HTTP 200 + `user.nim` = "12345678" di DB | Integration | High |
| TC-INT-UP-003 | Update picture via file upload | User mahasiswa ter-create, token valid | `PUT /api/user/profile` dengan file `test.png` | HTTP 200 + `user.profile.picture` defined | Integration | High |
| TC-INT-UP-004 | Update fullname + nim sekaligus | User mahasiswa ter-create, token valid | `PUT /api/user/profile` dengan fullname dan nim | HTTP 200 + kedua field terupdate di DB | Integration | High |
| TC-INT-UP-005 | Payload kosong | User mahasiswa ter-create, token valid | `PUT /api/user/profile` dengan `{}` | HTTP 400 | Integration | Medium |
| TC-INT-UP-006 | Tanpa token | Tidak ada token | `PUT /api/user/profile` dengan `{ fullname: "Test" }` | HTTP 401 | Integration | High |
| TC-INT-UP-007 | Token invalid | Token tidak valid | `PUT /api/user/profile` dengan `Authorization: Bearer invalid` | HTTP 401 | Integration | High |
| TC-INT-UP-008 | User dihapus — token masih valid | User dihapus, token masih valid | `PUT /api/user/profile` dengan token valid | HTTP 401 | Integration | Medium |
| TC-INT-UP-009 | Fullname kosong | User mahasiswa ter-create, token valid | `PUT /api/user/profile` dengan `{ fullname: "" }` | HTTP 400 | Integration | Medium |
| TC-INT-UP-010 | NIM string kosong — OK (tidak update) | User mahasiswa ter-create, token valid | `PUT /api/user/profile` dengan `{ nim: "" }` | HTTP 200 | Integration | Low |
| TC-INT-UP-011 | Field tidak dikenal | User mahasiswa ter-create, token valid | `PUT /api/user/profile` dengan `{ unknown: "field" }` | HTTP 400 | Integration | Medium |
| TC-INT-UP-012 | Fullname sangat panjang | User mahasiswa ter-create, token valid | `PUT /api/user/profile` dengan fullname panjang | HTTP 200 | Integration | Low |
| TC-INT-UP-013 | Partial update fullname | User mahasiswa ter-create, token valid | `PUT /api/user/profile` dengan `{ fullname: "Partial" }` | HTTP 200 | Integration | Low |
| TC-INT-UP-014 | Partial update nim | User mahasiswa ter-create, token valid | `PUT /api/user/profile` dengan `{ nim: "555" }` | HTTP 200 | Integration | Low |
| TC-INT-UP-015 | Multiple request konsisten | User mahasiswa ter-create, token valid | `PUT /api/user/profile` dengan fullname "First" dua kali | HTTP 200 + fullname tetap "First" di DB | Integration | Low |
| TC-INT-UP-016 | Role psikolog dilarang akses endpoint mahasiswa | User role psikolog | `PUT /api/user/profile` dengan token psikolog | HTTP 403 | Integration | High |
| TC-INT-UP-017 | Role admin dilarang akses endpoint mahasiswa | User role admin | `PUT /api/user/profile` dengan token admin | HTTP 403 | Integration | High |
| TC-INT-UP-018 | User dihapus (RBAC layer) | User mahasiswa dihapus, token valid | `PUT /api/user/profile` dengan token valid | HTTP 401 | Integration | Medium |

---

### Psikolog Profile

#### Unit Tests - Psikolog Service

| ID | Scenario | Precondition | Steps | Expected Result | Type | Priority |
|---|---|---|---|---|---|---|
| TC-PSI-UP-01 | userId tidak diberikan | Mock siap | Call `updatePsychologistProfile()` dengan `userId: undefined` | Throws error | Unit | High |
| TC-PSI-UP-02 | User tidak ditemukan | `UserModel.findById` returns null | Call `updatePsychologistProfile()` dengan userId valid | Throws error | Unit | High |
| TC-PSI-UP-03 | Update fullname valid | User ditemukan di mock | Call `updatePsychologistProfile()` dengan `fullname: "New Name"` | `user.profile.fullname` = "New Name" + `result.profile.fullname` = "New Name" | Unit | High |
| TC-PSI-UP-04 | Tanpa nim (ignored by service) | User ditemukan di mock | Call `updatePsychologistProfile()` tanpa parameter tambahan | `user.profile.fullname` tetap "Old Name" | Unit | Low |
| TC-PSI-UP-05 | Update picture valid | User ditemukan di mock | Call `updatePsychologistProfile()` dengan `picture: "/new.png"` | `user.profile.picture` = "/new.png" | Unit | High |
| TC-PSI-UP-06 | Update multiple field | User ditemukan di mock | Call `updatePsychologistProfile()` dengan fullname, description, specialization, educationBackground, picture | Semua field terupdate sesuai nilai baru | Unit | High |
| TC-PSI-UP-07 | Tidak ada field diupdate | User ditemukan di mock | Call `updatePsychologistProfile()` hanya dengan userId | `result.profile.fullname` tetap "Old Name" | Unit | Low |
| TC-PSI-UP-08 | Fullname kosong | User ditemukan di mock | Call `updatePsychologistProfile()` dengan `fullname: ""` | `user.profile.fullname` tetap "Old Name" | Unit | Medium |
| TC-PSI-UP-09 | educationBackground kosong/undefined | User ditemukan di mock | Call `updatePsychologistProfile()` dengan `educationBackground: undefined` | `user.profile.educationBackground` tetap `[]` | Unit | Medium |
| TC-PSI-UP-10 | Picture kosong | User ditemukan di mock | Call `updatePsychologistProfile()` dengan `picture: ""` | `user.profile.picture` tetap "/old.png" | Unit | Medium |
| TC-PSI-UP-11 | Fullname whitespace | User ditemukan di mock | Call `updatePsychologistProfile()` dengan `fullname: " Aidil "` | `user.profile.fullname` = " Aidil " (tanpa trimming) | Unit | Low |
| TC-PSI-UP-12 | Fullname emoji | User ditemukan di mock | Call `updatePsychologistProfile()` dengan `fullname: "😀🔥"` | `user.profile.fullname` = "😀🔥" | Unit | Low |
| TC-PSI-UP-13 | Tipe data tidak valid | User ditemukan di mock | Call `updatePsychologistProfile()` dengan `fullname: 123` | `user.profile.fullname` = 123 (no validation) | Unit | Low |
| TC-PSI-UP-14 | Database error saat save | `save` di-mock throw Error | Call `updatePsychologistProfile()` dengan `fullname: "Test"` | Throws error | Unit | Medium |
| TC-PSI-UP-15 | Concurrent update | User ditemukan di mock | Call `Promise.all([update A, update B])` | `save` terpanggil 2 kali | Unit | Low |

#### Integration Tests - Psikolog Profile API

| ID | Scenario | Precondition | Steps | Expected Result | Type | Priority |
|---|---|---|---|---|---|---|
| TC-INT-PSI-UP-001 | Tanpa token | User psikolog ter-create | `PUT /api/psikolog/profile` tanpa Authorization | HTTP 401 + profile tidak berubah | Integration | High |
| TC-INT-PSI-UP-002 | Token invalid | User psikolog ter-create | `PUT /api/psikolog/profile` dengan token invalid | HTTP 401 + profile tidak berubah | Integration | High |
| TC-INT-PSI-UP-003 | Role mahasiswa dilarang | User mahasiswa ter-create | `PUT /api/psikolog/profile` dengan token mahasiswa | HTTP 403 + profile tidak berubah | Integration | High |
| TC-INT-PSI-UP-004 | Role admin dilarang | User admin ter-create | `PUT /api/psikolog/profile` dengan token admin | HTTP 403 + profile tidak berubah | Integration | High |
| TC-INT-PSI-UP-005 | User dihapus | User psikolog dihapus, token masih valid | `PUT /api/psikolog/profile` dengan token valid | HTTP 401 | Integration | Medium |
| TC-INT-PSI-UP-006 | Payload kosong | User psikolog ter-create, token valid | `PUT /api/psikolog/profile` dengan `{}` | HTTP 400 + profile tidak berubah | Integration | Medium |
| TC-INT-PSI-UP-007 | educationBackground bukan array | User psikolog ter-create, token valid | `PUT /api/psikolog/profile` dengan `{ educationBackground: "invalid" }` | HTTP 400 + profile tidak berubah | Integration | Medium |
| TC-INT-PSI-UP-008 | Field tidak dikenal | User psikolog ter-create, token valid | `PUT /api/psikolog/profile` dengan `{ unknown: "field" }` | HTTP 400 + profile tidak berubah | Integration | Medium |
| TC-INT-PSI-UP-009 | Fullname kosong — OK (diabaikan) | User psikolog ter-create, token valid | `PUT /api/psikolog/profile` dengan `{ fullname: "" }` | HTTP 200 + fullname tidak berubah | Integration | Low |
| TC-INT-PSI-UP-010 | Description kosong — OK | User psikolog ter-create, token valid | `PUT /api/psikolog/profile` dengan `{ description: "" }` | HTTP 200 + `description` = "" | Integration | Low |
| TC-INT-PSI-UP-011 | Specialization kosong — OK | User psikolog ter-create, token valid | `PUT /api/psikolog/profile` dengan `{ specialization: "" }` | HTTP 200 + `specialization` = "" | Integration | Low |
| TC-INT-PSI-UP-012 | educationBackground array kosong — OK | User psikolog ter-create, token valid | `PUT /api/psikolog/profile` dengan `{ educationBackground: [] }` | HTTP 200 + `educationBackground` = [] | Integration | Low |
| TC-INT-PSI-UP-013 | Update fullname berhasil | User psikolog ter-create, token valid | `PUT /api/psikolog/profile` dengan `{ fullname: "New Name" }` | HTTP 200 + `user.profile.fullname` = "New Name" di DB | Integration | High |
| TC-INT-PSI-UP-014 | Update description berhasil | User psikolog ter-create, token valid | `PUT /api/psikolog/profile` dengan `{ description: "Desc" }` | HTTP 200 + `user.profile.description` = "Desc" di DB | Integration | High |
| TC-INT-PSI-UP-015 | Update specialization berhasil | User psikolog ter-create, token valid | `PUT /api/psikolog/profile` dengan `{ specialization: "Anxiety" }` | HTTP 200 + `user.profile.specialization` = "Anxiety" di DB | Integration | High |
| TC-INT-PSI-UP-016 | Update educationBackground berhasil | User psikolog ter-create, token valid | `PUT /api/psikolog/profile` dengan `{ educationBackground: ["S1"] }` | HTTP 200 + `user.profile.educationBackground` = ["S1"] di DB | Integration | High |
| TC-INT-PSI-UP-017 | Update picture via file upload | User psikolog ter-create, token valid | `PUT /api/psikolog/profile` dengan file `test.png` | HTTP 200 + `user.profile.picture` mengandung `/uploads/` | Integration | High |
| TC-INT-PSI-UP-018 | Ganti picture — path berubah | User psikolog sudah punya picture | Upload picture baru | HTTP 200 + path picture berbeda dari sebelumnya | Integration | Medium |
| TC-INT-PSI-UP-019 | Update multiple field berhasil | User psikolog ter-create, token valid | `PUT /api/psikolog/profile` dengan fullname, description, specialization, educationBackground | HTTP 200 + semua field terupdate di DB | Integration | High |
| TC-INT-PSI-UP-020 | Update idempotent | User psikolog ter-create, token valid | Update dengan fullname "Same" dua kali | HTTP 200 + fullname tetap "Same" | Integration | Low |

---

### Management User (Admin)

#### Unit Tests - Admin Service

| ID | Scenario | Precondition | Steps | Expected Result | Type | Priority |
|---|---|---|---|---|---|---|
| TC-UM-001 | getAllUsers berhasil dengan data | `find()` returns 2 user | Call `getAllUsers()` | Returns array berisi 2 user | Unit | High |
| TC-UM-002 | getAllUsers tidak ada data | `find()` returns [] | Call `getAllUsers()` | Returns array kosong | Unit | Medium |
| TC-UM-023 | getAllUsers DB error | `find()` throw Internal server error | Call `getAllUsers()` | Throws Internal server error | Unit | Medium |
| TC-UM-003 | getUserProfileById berhasil | `findById` returns user | Call `getUserProfileById()` dengan ID valid | Returns object mengandung email dan nim | Unit | High |
| TC-UM-004 | getUserProfileById tidak ditemukan | `findById` returns null | Call `getUserProfileById()` dengan ID tidak ada | Returns null | Unit | Medium |
| TC-UM-005 | createUserRecord berhasil | `save()` berhasil | Call `createUserRecord()` dengan data lengkap | `save` terpanggil + result defined | Unit | High |
| TC-UM-006 | NIM berisi spasi | Mock user dengan `nim: ""` | Call `createUserRecord()` dengan `nim: "   "` | `saved.nim` = "" | Unit | Low |
| TC-UM-007 | Fullname dan picture tidak disertakan | Mock user dengan profile kosong | Call `createUserRecord()` tanpa fullname dan picture | `profile.fullname` = "" dan `profile.picture` = "" | Unit | Low |
| TC-UM-024 | createUserRecord DB error | `save()` throw Error | Call `createUserRecord()` | Throws Internal server error | Unit | Medium |
| TC-UM-008 | updateUserRecord tidak menemukan user | `findById` returns null | Call `updateUserRecord()` dengan userId valid | Returns null | Unit | Medium |
| TC-UM-009 | Update email | User ditemukan, `save` berhasil | Call `updateUserRecord()` dengan `email: "new@email.com"` | `user.email` = "new@email.com" + `save` dipanggil | Unit | High |
| TC-UM-010 | Update password di-hash | `hashValue` di-mock, user ditemukan | Call `updateUserRecord()` dengan `password: "newplain"` | `hashValue` dipanggil + `user.password` = "hashed_password" | Unit | High |
| TC-UM-011 | Update role | User ditemukan, `save` berhasil | Call `updateUserRecord()` dengan `role: "psikolog"` | `user.role` = "psikolog" | Unit | High |
| TC-UM-012 | Update fullname | User ditemukan, `save` berhasil | Call `updateUserRecord()` dengan `fullname: "Nama Baru"` | `user.profile.fullname` = "Nama Baru" | Unit | High |
| TC-UM-013 | Update specialization | User ditemukan, `save` berhasil | Call `updateUserRecord()` dengan `specialization: "Klinis"` | `user.profile.specialization` = "Klinis" | Unit | Medium |
| TC-UM-014 | Update educationBackground | User ditemukan, `save` berhasil | Call `updateUserRecord()` dengan `educationBackground: ["S1", "S2"]` | `user.profile.educationBackground` = ["S1", "S2"] | Unit | Medium |
| TC-UM-015 | Tidak ada field diupdate | User ditemukan | Call `updateUserRecord()` hanya dengan userId | `user.email` tetap sama | Unit | Low |
| TC-UM-022 | userId format tidak valid | `findById` throw Error | Call `updateUserRecord()` dengan `userId: "invalid-id"` | Throws Invalid user | Unit | Medium |
| TC-UM-025 | DB error saat save update | `save` throw Error | Call `updateUserRecord()` dengan email baru | Throws Internal server error | Unit | Medium |
| TC-UM-016 | deleteUserRecord tidak ditemukan | `findByIdAndDelete` returns null | Call `deleteUserRecord()` dengan ID tidak ada | Returns null | Unit | Medium |
| TC-UM-017 | deleteUserRecord berhasil | `findByIdAndDelete` returns user | Call `deleteUserRecord()` dengan ID valid | Returns object user yang terhapus | Unit | High |
| TC-UM-018 | getAllConsultationRecords berhasil | Chain mock returns 1 consultation | Call `getAllConsultationRecords()` | Returns array dengan 1 item ter-format | Unit | High |
| TC-UM-019 | getAllConsultationRecords kosong | Chain mock returns [] | Call `getAllConsultationRecords()` | Returns array kosong | Unit | Medium |
| TC-UM-020 | Profile tanpa fullname — default "" | Consultation dengan profile tanpa fullname | Call `getAllConsultationRecords()` | `user.fullname` = "" dan `psychologist.fullname` = "" | Unit | Low |
| TC-UM-021 | Mapping struktur lengkap | Consultation data valid | Call `getAllConsultationRecords()` | Item memiliki consultationId, psychologist._id, fullname, email, user._id, fullname, email, status, createdAt | Unit | Medium |

#### Integration Tests - Management User API

| ID | Scenario | Precondition | Steps | Expected Result | Type | Priority |
|---|---|---|---|---|---|---|
| TC-INT-001 | Tanpa token | Admin di DB | `GET /api/admin/users/all` tanpa header | HTTP 401 | Integration | High |
| TC-INT-002 | Token invalid | Admin di DB | `GET /api/admin/users/all` dengan token invalid | HTTP 401 | Integration | High |
| TC-INT-003 | Role bukan admin | Non-admin user di DB | `GET /api/admin/users/all` dengan token mahasiswa | HTTP 403 | Integration | High |
| TC-INT-004 | Admin get all users berhasil | Admin di DB | `GET /api/admin/users/all` dengan token admin | HTTP 200 + `data` adalah array | Integration | High |
| TC-INT-005 | Tidak ada user di DB (hanya admin) | Hanya admin di DB | `GET /api/admin/users/all` dengan token admin | HTTP 200 + `data.length` = 1 + `data[0].role` = "admin" | Integration | Medium |
| TC-INT-007 | Get user by valid ID | User ter-create | `GET /api/admin/users/:id` dengan ID valid | HTTP 200 + `data` defined | Integration | High |
| TC-INT-008 | User not found | User tidak ada | `GET /api/admin/users/:fakeId` | HTTP 404 | Integration | Medium |
| TC-INT-009 | ID format invalid | - | `GET /api/admin/users/invalid-id` | HTTP 500 | Integration | Low |
| TC-INT-010 | Create user tanpa picture | Admin di DB | `POST /api/admin/users` dengan email, password, role | HTTP 201 + `data.email` sesuai input | Integration | High |
| TC-INT-012 | Create user dengan email duplikat | User dengan email sama sudah ada | `POST /api/admin/users` dengan email duplikat | HTTP 500 | Integration | Medium |
| TC-INT-013 | Create user tanpa required field | Admin di DB | `POST /api/admin/users` dengan body `{}` | HTTP 500 | Integration | Medium |
| TC-INT-015 | Update user berhasil | User ter-create | `PUT /api/admin/users/:id` dengan email baru | HTTP 200 + `data` defined | Integration | High |
| TC-INT-017 | Update password di-hash | User ter-create | `PUT /api/admin/users/:id` dengan `{ password: "newpassword" }` | `user.password` != "newpassword" di DB | Integration | High |
| TC-INT-018 | Update user not found | User tidak ada | `PUT /api/admin/users/:fakeId` | HTTP 404 | Integration | Medium |
| TC-INT-021 | Delete user berhasil | User ter-create | `DELETE /api/admin/users/:id` dengan ID valid | HTTP 200 | Integration | High |
| TC-INT-022 | Delete user not found | User tidak ada | `DELETE /api/admin/users/:fakeId` | HTTP 404 | Integration | Medium |
| TC-INT-023 | Delete ID invalid | - | `DELETE /api/admin/users/invalid-id` | HTTP 500 | Integration | Low |

---

## Consultation

### Consultation Mahasiswa

#### Unit Tests - Consultation Mahasiswa Service

| ID | Scenario | Precondition | Steps | Expected Result | Type | Priority |
|---|---|---|---|---|---|---|
| CONS-MHS-01 | Tanpa login (applyConsultation) | Tidak ada session | Call `applyConsultation()` dengan `userId: undefined` | Throws AppError 401 "Unauthorized access" | Unit | High |
| CONS-MHS-02 | psychologistId kosong | userId ada | Call `applyConsultation()` dengan `psychologistId: ""` | Throws AppError 400 "psychologistId is required" | Unit | High |
| CONS-MHS-03 | psychologistId format invalid | userId ada | Call `applyConsultation()` dengan `psychologistId: "invalid-id"` | Throws AppError 400 "Invalid psychologistId format" | Unit | High |
| CONS-MHS-04 | Psikolog tidak ditemukan | userId ada, `users.findOne` returns null | Call `applyConsultation()` dengan psychologistId valid | Throws AppError 404 "Psychologist not found" | Unit | High |
| CONS-MHS-05 | Role bukan mahasiswa | userId ada, psikolog ada | Call `applyConsultation()` dengan `role: "psikolog"` | Throws AppError 403 "Only mahasiswa allowed" | Unit | High |
| CONS-MHS-06 | Duplicate consultation | Consultation sudah ada | Call `applyConsultation()` dengan data yang sudah pernah diajukan | Throws AppError 409 "Consultation already exists" | Unit | High |
| CONS-MHS-15 | Create consultation sukses | Tidak ada consultation aktif, psikolog ada | Call `applyConsultation()` dengan semua data valid | Returns `{ statusCode: 201, message: "Consultation created" }` | Unit | High |
| CONS-MHS-07 | Akses consultation milik orang lain | Consultation milik user lain | Call `getConsultationDetail()` dengan userId berbeda | Throws AppError 403 "Access denied" | Unit | High |
| CONS-MHS-08 | consultationId invalid | - | Call `getConsultationDetail()` dengan `consultationId: "invalid"` | Throws AppError 400 "Invalid consultationId" | Unit | High |
| CONS-MHS-09 | Consultation tidak ditemukan | `findById` returns null | Call `getConsultationDetail()` dengan ID tidak ada | Throws AppError 404 "Consultation not found" | Unit | Medium |
| CONS-MHS-16 | Get list consultation berhasil | Consultation ada di mock | Call `getConsultationList()` dengan userId valid | Returns array dengan 1 item | Unit | High |
| CONS-MHS-17 | Get detail consultation berhasil | Consultation milik user ini | Call `getConsultationDetail()` dengan userId dan consultationId yang sesuai | Returns defined result | Unit | High |
| CONS-MHS-10 | Kirim pesan tanpa login | - | Call `sendMessage()` dengan `userId: undefined` | Throws AppError 401 "Unauthorized access" | Unit | High |
| CONS-MHS-11 | Kirim pesan saat consultation pending | Consultation status pending | Call `sendMessage()` dengan status "pending" | Throws AppError 400 "Consultation not active" | Unit | High |
| CONS-MHS-12 | Kirim pesan saat consultation rejected | Consultation status rejected | Call `sendMessage()` dengan status "rejected" | Throws AppError 400 "Consultation not active" | Unit | High |
| CONS-MHS-13 | Kirim pesan kosong | Consultation accepted, chat room active | Call `sendMessage()` dengan `message: ""` | Throws AppError 400 `EMPTY_MESSAGE` | Unit | High |
| CONS-MHS-14 | Kirim pesan terlalu panjang | Consultation accepted, chat room active | Call `sendMessage()` dengan message 2000 karakter | Throws AppError 413 `MESSAGE_TOO_LONG` | Unit | Medium |
| CONS-MHS-18 | Kirim pesan sukses | Consultation accepted, chat room active, user adalah participant | Call `sendMessage()` dengan message valid | Returns `{ statusCode: 200 }` + 1 pesan ditambahkan ke room | Unit | High |

#### Integration Tests - Consultation Mahasiswa API

| ID | Scenario | Precondition | Steps | Expected Result | Type | Priority |
|---|---|---|---|---|---|---|
| TC-INT-CONS-MHS-001 | Tanpa token (apply) | - | `POST /api/consultation/apply` tanpa token | HTTP 401 + tidak ada consultation/room di DB | Integration | High |
| TC-INT-CONS-MHS-002 | Role bukan mahasiswa (apply) | Token psikolog valid | `POST /api/consultation/apply` dengan token psikolog | HTTP 403 + tidak ada consultation di DB | Integration | High |
| TC-INT-CONS-MHS-003 | psychologistId kosong | Token mahasiswa valid | `POST /api/consultation/apply` tanpa psychologistId | HTTP 400 + tidak ada consultation di DB | Integration | High |
| TC-INT-CONS-MHS-004 | psychologistId format invalid | Token mahasiswa valid | `POST /api/consultation/apply` dengan psychologistId "123" | HTTP 400 | Integration | High |
| TC-INT-CONS-MHS-005 | Psikolog tidak ditemukan | Token mahasiswa valid, psikologId random | `POST /api/consultation/apply` dengan ID psikolog tidak ada | HTTP 404 | Integration | High |
| TC-INT-CONS-MHS-006 | Message kosong | Token mahasiswa valid | `POST /api/consultation/apply` dengan `message: ""` | HTTP 400 | Integration | High |
| TC-INT-CONS-MHS-007 | Message terlalu panjang | Token mahasiswa valid | `POST /api/consultation/apply` dengan message 1001 karakter | HTTP 413 | Integration | Medium |
| TC-INT-CONS-MHS-008 | Duplicate pending consultation | Consultation pending sudah ada | `POST /api/consultation/apply` dengan psikolog yang sama | HTTP 409 | Integration | High |
| TC-INT-CONS-MHS-009 | Apply consultation berhasil | Tidak ada consultation sebelumnya | `POST /api/consultation/apply` dengan data valid | HTTP 201 + 1 consultation (status pending) + 1 chatRoom (status inactive) di DB | Integration | High |
| TC-INT-CONS-MHS-010 | Tanpa token (get history) | - | `GET /api/user/consultation/history` tanpa token | HTTP 401 | Integration | High |
| TC-INT-CONS-MHS-011 | Get history — hanya data milik sendiri | 2 consultation di DB (1 milik sendiri) | `GET /api/user/consultation/history` dengan token mahasiswa | HTTP 200 + `data.length` = 1 | Integration | High |
| TC-INT-CONS-MHS-012 | History kosong | Tidak ada consultation | `GET /api/user/consultation/history` dengan token mahasiswa | HTTP 200 + `data.length` = 0 | Integration | Medium |
| TC-INT-CONS-MHS-013 | Tanpa token (get detail) | - | `GET /api/user/consultation/history/:id` tanpa token | HTTP 401 | Integration | High |
| TC-INT-CONS-MHS-014 | ID consultation invalid | Token mahasiswa valid | `GET /api/user/consultation/history/abc` | HTTP 400 | Integration | Medium |
| TC-INT-CONS-MHS-015 | Consultation tidak ditemukan | Token mahasiswa valid | `GET /api/user/consultation/history/:fakeId` | HTTP 404 | Integration | Medium |
| TC-INT-CONS-MHS-016 | Akses consultation milik user lain | Consultation milik user lain ada | `GET /api/user/consultation/history/:id` dengan token user lain | HTTP 403 | Integration | High |
| TC-INT-CONS-MHS-017 | Get detail berhasil | Consultation milik mahasiswa ini | `GET /api/user/consultation/history/:id` dengan token mahasiswa | HTTP 200 + `data._id` sesuai ID consultation | Integration | High |

---

### Consultation Psikolog

#### Unit Tests - Consultation Psikolog Service

| ID | Scenario | Precondition | Steps | Expected Result | Type | Priority |
|---|---|---|---|---|---|---|
| CONS-PSI-01 | Tanpa login (sendMessage) | - | Call `sendMessage()` dengan `userId: undefined` | Throws AppError | Unit | High |
| CONS-PSI-02 | Role bukan psikolog (owner mismatch) | Consultation ditemukan dengan psychologistId berbeda | Call `updateConsultation()` dengan `psychologistId: "bukan-psi"` | Throws AppError | Unit | High |
| CONS-PSI-03 | consultationId invalid | - | Call `updateConsultation()` dengan `consultationId: "invalid"` | Throws AppError | Unit | High |
| CONS-PSI-04 | Consultation tidak ditemukan | `findById` returns null | Call `updateConsultation()` dengan ID tidak ada | Throws AppError | Unit | Medium |
| CONS-PSI-05 | Accept milik psikolog lain | Consultation milik psikolog lain | Call `updateConsultation()` dengan psychologistId berbeda | Throws AppError | Unit | High |
| CONS-PSI-06 | Reject milik psikolog lain | Consultation milik psikolog lain | Call `updateConsultation()` dengan status "rejected" dan psychologistId berbeda | Throws AppError | Unit | High |
| CONS-PSI-07 | Accept bukan pending | Consultation sudah accepted | Call `updateConsultation()` dengan status "accepted" | Throws AppError | Unit | High |
| CONS-PSI-08 | Reject bukan pending | Consultation sudah rejected | Call `updateConsultation()` dengan status "rejected" | Throws AppError | Unit | High |
| CONS-PSI-09 | Kirim pesan tanpa login | - | Call `sendMessage()` dengan `userId: undefined` | Throws AppError | Unit | High |
| CONS-PSI-10 | Kirim pesan saat pending | Consultation status pending | Call `sendMessage()` dengan status "pending" | Throws AppError | Unit | High |
| CONS-PSI-11 | Kirim pesan saat rejected | Consultation status rejected | Call `sendMessage()` dengan status "rejected" | Throws AppError | Unit | High |
| CONS-PSI-12 | Kirim pesan kosong | Consultation accepted, room active | Call `sendMessage()` dengan `message: ""` | Throws AppError | Unit | High |
| CONS-PSI-13 | Pesan terlalu panjang | Consultation accepted, room active | Call `sendMessage()` dengan message 2000 karakter | Throws AppError | Unit | Medium |
| CONS-PSI-14 | Bukan participant | Consultation accepted, room active dengan participants lain | Call `sendMessage()` dengan userId bukan participant | Throws AppError | Unit | High |
| CONS-PSI-15 | Get list consultation berhasil | Mock returns [] | Call `getConsultationList()` dengan userId | Returns [] | Unit | High |
| CONS-PSI-16 | Accept consultation berhasil | Mock `findOneAndUpdate` returns accepted consultation | Call `updateConsultation()` dengan status "accepted" | `findOneAndUpdate` dipanggil dengan query yang benar + `res.status` = "accepted" | Unit | High |
| CONS-PSI-17 | Reject consultation berhasil | Mock `findOneAndUpdate` returns rejected consultation | Call `updateConsultation()` dengan status "rejected" | `findOneAndUpdate` dipanggil dengan query yang benar + `res.status` = "rejected" | Unit | High |
| CONS-PSI-18 | Kirim pesan berhasil | Consultation accepted, user adalah participant | Call `sendMessage()` dengan message valid | Returns `{ statusCode: 200, message: "Message sent" }` + `save` dipanggil | Unit | High |

#### Integration Tests - Consultation Psikolog API

| ID | Scenario | Precondition | Steps | Expected Result | Type | Priority |
|---|---|---|---|---|---|---|
| TC-INT-CONS-PSI-001 | Tanpa token (get notifications) | - | `GET /api/psikolog/notifications` tanpa token | HTTP 401 | Integration | High |
| TC-INT-CONS-PSI-002 | Role bukan psikolog (get notifications) | Token mahasiswa valid | `GET /api/psikolog/notifications` dengan token mahasiswa | HTTP 403 | Integration | High |
| TC-INT-CONS-PSI-003 | Tidak ada consultation | Psikolog login, tidak ada consultation | `GET /api/psikolog/notifications` dengan token psikolog | HTTP 200 + `data` = [] | Integration | Medium |
| TC-INT-CONS-PSI-004 | Ada consultation — data sesuai DB | 3 consultation di DB | `GET /api/psikolog/notifications` dengan token psikolog | HTTP 200 + `data.length` = 3, tiap item punya consultationId, user, status | Integration | High |
| TC-INT-CONS-PSI-005 | Data hanya milik psikolog login | 2 consultation (1 milik psikolog ini, 1 milik lain) | `GET /api/psikolog/notifications` dengan token psikolog | HTTP 200 + `data.length` = 1 | Integration | High |
| TC-INT-CONS-PSI-006 | Format response sesuai | 1 consultation di DB | `GET /api/psikolog/notifications` dengan token psikolog | Item punya consultationId, user._id, user.email, message, status | Integration | Medium |
| TC-INT-CONS-PSI-007 | Tanpa token (update status) | - | `PUT /api/psikolog/123/status` tanpa token | HTTP 401 | Integration | High |
| TC-INT-CONS-PSI-008 | Role bukan psikolog (update status) | Token mahasiswa valid | `PUT /api/psikolog/:id/status` dengan token mahasiswa | HTTP 403 | Integration | High |
| TC-INT-CONS-PSI-009 | ID invalid (update status) | Token psikolog valid | `PUT /api/psikolog/123/status` dengan token psikolog | HTTP 400 | Integration | Medium |
| TC-INT-CONS-PSI-010 | Consultation tidak ada | Token psikolog valid | `PUT /api/psikolog/:fakeId/status` | HTTP 404 | Integration | Medium |
| TC-INT-CONS-PSI-011 | Bukan owner consultation | Consultation milik psikolog lain | `PUT /api/psikolog/:id/status` dengan token psikolog yang bukan owner | HTTP 403 | Integration | High |
| TC-INT-CONS-PSI-012 | Status tidak valid | Token psikolog valid, consultation pending | `PUT /api/psikolog/:id/status` dengan `{ status: "pending" }` | HTTP 400 | Integration | Medium |
| TC-INT-CONS-PSI-013 | Update status bukan pending | Consultation status accepted | `PUT /api/psikolog/:id/status` dengan status "rejected" | HTTP 400 | Integration | High |
| TC-INT-CONS-PSI-014 | Pending → accepted: update DB dan aktifkan room | Consultation pending, room inactive | `PUT /api/psikolog/:id/status` dengan `{ status: "accepted" }` | HTTP 200 + consultation status "accepted" + room status "active" di DB | Integration | High |
| TC-INT-CONS-PSI-015 | Pending → rejected: update DB saja | Consultation pending, room inactive | `PUT /api/psikolog/:id/status` dengan `{ status: "rejected" }` | HTTP 200 + consultation status "rejected" + room tetap "inactive" | Integration | High |
| TC-INT-CONS-PSI-016 | ChatRoom tidak ada — tidak crash | Consultation pending tanpa chatRoom | `PUT /api/psikolog/:id/status` dengan status "accepted" | HTTP 200 + consultation status "accepted" | Integration | Medium |
| TC-INT-CONS-PSI-017 | Response structure sesuai | Consultation pending | `PUT /api/psikolog/:id/status` dengan status "accepted" | HTTP 200 + response punya `message` dan `data._id` | Integration | Low |
| TC-INT-CONS-PSI-018 | Race condition — hanya satu berhasil | Consultation pending | 2 request accept bersamaan | 1 request HTTP 200, 1 request HTTP 400 | Integration | Medium |

---

## Chat

### Chat Mahasiswa

#### Unit Tests - Chat Mahasiswa Service

| ID | Scenario | Precondition | Steps | Expected Result | Type | Priority |
|---|---|---|---|---|---|---|
| TC-MHS-01 | Tanpa userId (sendMessage) | - | Call `sendMessageAsMahasiswa()` dengan `userId: undefined` | Throws UNAUTHORIZED | Unit | High |
| TC-MHS-02 | consultationId kosong | userId ada | Call `sendMessageAsMahasiswa()` dengan `consultationId: ""` | Throws "Consultation ID required" | Unit | High |
| TC-MHS-03 | consultationId format invalid | userId ada | Call `sendMessageAsMahasiswa()` dengan `consultationId: "invalid"` | Throws "Invalid consultation ID" | Unit | High |
| TC-MHS-04 | Consultation tidak ditemukan | `findById` returns null | Call `sendMessageAsMahasiswa()` dengan consultationId valid | Throws "Consultation not found" | Unit | Medium |
| TC-MHS-05 | ChatRoom tidak ditemukan | Consultation ada, `chatRoom.findOne` returns null | Call `sendMessageAsMahasiswa()` | Throws "Chat room not found" | Unit | Medium |
| TC-MHS-06 | ChatRoom inactive | Consultation ada, room status "inactive" | Call `sendMessageAsMahasiswa()` | Throws "Chat room is not active" | Unit | Medium |
| TC-MHS-07 | Consultation pending | Consultation status "pending", room active | Call `sendMessageAsMahasiswa()` | Throws CONSULTATION_NOT_ACTIVE | Unit | High |
| TC-MHS-08 | Consultation rejected | Consultation status "rejected", room active | Call `sendMessageAsMahasiswa()` | Throws CONSULTATION_NOT_ACTIVE | Unit | High |
| TC-MHS-09 | Bukan participant | Consultation accepted, user bukan participant | Call `sendMessageAsMahasiswa()` | Throws NOT_PARTICIPANT | Unit | High |
| TC-MHS-10 | Message undefined | Consultation accepted, user participant | Call `sendMessageAsMahasiswa()` dengan `message: undefined` | Throws EMPTY_MESSAGE | Unit | High |
| TC-MHS-11 | Message null | Consultation accepted, user participant | Call `sendMessageAsMahasiswa()` dengan `message: null` | Throws EMPTY_MESSAGE | Unit | High |
| TC-MHS-12 | Message kosong | Consultation accepted, user participant | Call `sendMessageAsMahasiswa()` dengan `message: ""` | Throws EMPTY_MESSAGE | Unit | High |
| TC-MHS-13 | Message hanya spasi | Consultation accepted, user participant | Call `sendMessageAsMahasiswa()` dengan `message: "   "` | Throws EMPTY_MESSAGE | Unit | Medium |
| TC-MHS-14 | Message terlalu panjang | Consultation accepted, user participant | Call `sendMessageAsMahasiswa()` dengan message 1001 karakter | Throws MESSAGE_TOO_LONG | Unit | Medium |
| TC-MHS-15 | Message mengandung script | Consultation accepted, user participant | Call `sendMessageAsMahasiswa()` dengan `message: "<script>"` | Throws "Invalid message content" | Unit | Medium |
| TC-MHS-16 | Error saat find consultation | `findById` throw Error | Call `sendMessageAsMahasiswa()` | Throws "Internal server error" | Unit | Low |
| TC-MHS-17 | Error saat find chatroom | Consultation ada, `chatRoom.findOne` throw Error | Call `sendMessageAsMahasiswa()` | Throws "Internal server error" | Unit | Low |
| TC-MHS-18 | Error saat save message | Consultation dan room ada, `save` throw Error | Call `sendMessageAsMahasiswa()` dengan message valid | Throws "Failed to send message" | Unit | Medium |
| TC-MHS-19 | Kirim pesan berhasil | Semua kondisi valid | Call `sendMessageAsMahasiswa()` dengan message "hello" | Returns `{ statusCode: 200, data.message: "hello" }` | Unit | High |
| TC-MHS-20 | Validasi field response | Semua kondisi valid | Call `sendMessageAsMahasiswa()` dengan message "hi" | Response data punya senderId, message, timestamp | Unit | Medium |
| TC-MHS-21 | Timestamp otomatis — valid Date | Semua kondisi valid | Call `sendMessageAsMahasiswa()` dengan message "hi" | `res.data.timestamp` instanceof Date | Unit | Low |
| TC-MHS-22 | Tanpa consultationId (getChatAsMahasiswa) | userId ada | Call `getChatAsMahasiswa()` dengan `consultationId: ""` | Throws "Consultation ID required" | Unit | High |
| TC-MHS-23 | ChatRoom tidak ditemukan (getChatAsMahasiswa) | `chatRoom.findOne` returns null | Call `getChatAsMahasiswa()` dengan consultationId valid | Throws "Chat room not found" | Unit | Medium |
| TC-MHS-24 | Bukan participant (getChatAsMahasiswa) | Room dengan participant berbeda | Call `getChatAsMahasiswa()` dengan userId bukan participant | Throws FORBIDDEN | Unit | High |
| TC-MHS-25 | Error fetch messages | `chatRoom.findOne` throw Error | Call `getChatAsMahasiswa()` | Throws "Failed to fetch messages" | Unit | Low |
| TC-MHS-26 | Get chat berhasil | Room ditemukan, user participant | Call `getChatAsMahasiswa()` | Returns `{ statusCode: 200, data: Array }` | Unit | High |
| TC-MHS-27 | Urutan pesan ascending by timestamp | Room dengan 2 pesan tidak berurutan | Call `getChatAsMahasiswa()` | Pesan pertama di array adalah yang paling lama | Unit | Low |

#### Integration Tests - Chat Mahasiswa API

| ID | Scenario | Precondition | Steps | Expected Result | Type | Priority |
|---|---|---|---|---|---|---|
| TC-INT-CHAT-MHS-001 | Tanpa token (GET /rooms) | - | `GET /api/chat/rooms` tanpa token | HTTP 401 | Integration | High |
| TC-INT-CHAT-MHS-002 | Get rooms berhasil | ChatRoom milik user ada | `GET /api/chat/rooms` dengan token mahasiswa | HTTP 200 + array tidak kosong | Integration | High |
| TC-INT-CHAT-MHS-003 | Get rooms kosong | User baru tanpa room | `GET /api/chat/rooms` dengan token user baru | HTTP 200 + array kosong | Integration | Medium |
| TC-INT-CHAT-MHS-004 | Hanya room milik user yang dikembalikan | Room milik user lain ada | `GET /api/chat/rooms` dengan token mahasiswa | Room milik user lain tidak ada di response | Integration | High |
| TC-INT-CHAT-MHS-005 | Tanpa token (GET /messages) | - | `GET /api/chat/messages/:roomId` tanpa token | HTTP 401 | Integration | High |
| TC-INT-CHAT-MHS-006 | Room tidak ditemukan | - | `GET /api/chat/messages/:fakeRoomId` dengan token valid | HTTP 404 | Integration | Medium |
| TC-INT-CHAT-MHS-007 | Get messages berhasil | Room milik user ada | `GET /api/chat/messages/:roomId` dengan token mahasiswa | HTTP 200 + array | Integration | High |
| TC-INT-CHAT-MHS-008 | Akses room bukan milik user | Room milik user lain | `GET /api/chat/messages/:foreignRoomId` dengan token mahasiswa | HTTP 403 atau 404 | Integration | High |
| TC-INT-CHAT-MHS-009 | Tanpa field wajib (POST /messages) | Token mahasiswa valid | `POST /api/chat/messages` dengan body `{}` | HTTP 400 | Integration | High |
| TC-INT-CHAT-MHS-010 | Send message berhasil | Room aktif milik user | `POST /api/chat/messages` dengan roomId, senderId, message | HTTP 201 + `res.body.message` = "Test message" | Integration | High |
| TC-INT-CHAT-MHS-011 | Pesan tidak disimpan ke DB (in-memory only) | Room ada | `POST /api/chat/messages` dengan message valid | Pesan tidak ada di `room.messages` di DB | Integration | Medium |
| TC-INT-CHAT-MHS-018 | Struktur response sesuai | Room aktif milik user | `POST /api/chat/messages` dengan data valid | Response punya roomId, senderId, message, timestamp | Integration | Medium |
| TC-INT-CHAT-MHS-012 | Tanpa token (PATCH /finish) | - | `PATCH /api/chat/finish/:roomId` tanpa token | HTTP 401 | Integration | High |
| TC-INT-CHAT-MHS-013 | Room tidak ditemukan (finish) | - | `PATCH /api/chat/finish/:fakeId` dengan token valid | HTTP 404 | Integration | Medium |
| TC-INT-CHAT-MHS-014 | Finish chat berhasil | Room aktif | `PATCH /api/chat/finish/:roomId` dengan token mahasiswa | HTTP 200 + `room.status` = "inactive" di DB | Integration | High |
| TC-INT-CHAT-MHS-015 | Finish idempotent | Room sudah inactive | `PATCH /api/chat/finish/:roomId` dengan token mahasiswa | HTTP 200 + `room.status` tetap "inactive" | Integration | Low |
| TC-INT-CHAT-MHS-016 | Get messages setelah finish | Room inactive | `GET /api/chat/messages/:roomId` dengan token mahasiswa | HTTP 200 | Integration | Low |
| TC-INT-CHAT-MHS-017 | Kirim message ke room inactive | Room inactive | `POST /api/chat/messages` ke room inactive | HTTP 201 | Integration | Low |

---

### Chat Psikolog

#### Unit Tests - Chat Psikolog Service

| ID | Scenario | Precondition | Steps | Expected Result | Type | Priority |
|---|---|---|---|---|---|---|
| TC-PSI-01 | Tanpa userId (sendMessage) | - | Call `sendMessageAsPsychologist()` dengan `userId: undefined` | Throws UNAUTHORIZED | Unit | High |
| TC-PSI-02 | consultationId kosong | userId ada | Call `sendMessageAsPsychologist()` dengan `consultationId: ""` | Throws REQUIRED_CONSULTATION_ID | Unit | High |
| TC-PSI-03 | consultationId format invalid | userId ada | Call `sendMessageAsPsychologist()` dengan `consultationId: "invalid-id"` | Throws INVALID_ID | Unit | High |
| TC-PSI-04 | Consultation tidak ditemukan | `findById` returns null | Call `sendMessageAsPsychologist()` dengan consultationId valid | Throws CONSULTATION_NOT_FOUND | Unit | Medium |
| TC-PSI-05 | ChatRoom tidak ditemukan | Consultation ada, `chatRoom.findOne` returns null | Call `sendMessageAsPsychologist()` | Throws CHAT_ROOM_NOT_FOUND | Unit | Medium |
| TC-PSI-06 | ChatRoom inactive | Consultation ada, room status "inactive" | Call `sendMessageAsPsychologist()` | Throws CHAT_ROOM_INACTIVE | Unit | Medium |
| TC-PSI-07 | Consultation pending | Consultation status "pending", room active | Call `sendMessageAsPsychologist()` | Throws CONSULTATION_NOT_ACTIVE | Unit | High |
| TC-PSI-08 | Consultation rejected | Consultation status "rejected", room active | Call `sendMessageAsPsychologist()` | Throws CONSULTATION_NOT_ACTIVE | Unit | High |
| TC-PSI-09 | Psikolog bukan assigned | Consultation dengan psychologistId berbeda | Call `sendMessageAsPsychologist()` | Throws "Not authorized for this consultation" | Unit | High |
| TC-PSI-10 | Message undefined | Semua valid kecuali message | Call `sendMessageAsPsychologist()` dengan `message: undefined` | Throws MESSAGE_REQUIRED | Unit | High |
| TC-PSI-11 | Message null | Semua valid kecuali message | Call `sendMessageAsPsychologist()` dengan `message: null` | Throws MESSAGE_REQUIRED | Unit | High |
| TC-PSI-12 | Message kosong | Semua valid kecuali message | Call `sendMessageAsPsychologist()` dengan `message: ""` | Throws MESSAGE_REQUIRED | Unit | High |
| TC-PSI-13 | Message hanya spasi | Semua valid kecuali message | Call `sendMessageAsPsychologist()` dengan `message: "   "` | Throws MESSAGE_REQUIRED | Unit | Medium |
| TC-PSI-14 | Message terlalu panjang | Semua kondisi valid | Call `sendMessageAsPsychologist()` dengan message 1001 karakter | Throws MESSAGE_TOO_LONG | Unit | Medium |
| TC-PSI-15 | Message mengandung script | Semua kondisi valid | Call `sendMessageAsPsychologist()` dengan `message: "<script>"` | Throws INVALID_MESSAGE_CONTENT | Unit | Medium |
| TC-PSI-16 | Error saat find consultation | `findById` throw Error | Call `sendMessageAsPsychologist()` | Throws INTERNAL_SERVER_ERROR | Unit | Low |
| TC-PSI-17 | Error saat find chatroom | Consultation ada, `chatRoom.findOne` throw Error | Call `sendMessageAsPsychologist()` | Throws INTERNAL_SERVER_ERROR | Unit | Low |
| TC-PSI-18 | Error saat save | Semua ada, `save` throw Error | Call `sendMessageAsPsychologist()` dengan message valid | Throws FAILED_SEND_MESSAGE | Unit | Medium |
| TC-PSI-19 | Kirim pesan berhasil | Semua kondisi valid | Call `sendMessageAsPsychologist()` dengan message "hello" | Returns `{ statusCode: 200, data.message: "hello" }` | Unit | High |
| TC-PSI-20 | Validasi field response | Semua kondisi valid | Call `sendMessageAsPsychologist()` dengan message "hello" | Response data punya senderId, message, timestamp | Unit | Medium |
| TC-PSI-21 | Timestamp otomatis — valid Date | Semua kondisi valid | Call `sendMessageAsPsychologist()` dengan message "hello" | `result.data.timestamp` instanceof Date | Unit | Low |
| TC-PSI-22 | Tanpa consultationId (getChatAsPsychologist) | userId ada | Call `getChatAsPsychologist()` dengan `consultationId: undefined` | Throws REQUIRED_CONSULTATION_ID | Unit | High |
| TC-PSI-23 | ChatRoom tidak ditemukan | `chatRoom.findOne` returns null | Call `getChatAsPsychologist()` dengan consultationId valid | Throws CHAT_ROOM_NOT_FOUND | Unit | Medium |
| TC-PSI-24 | Bukan participant | Room dengan participants kosong | Call `getChatAsPsychologist()` dengan userId bukan participant | Throws FORBIDDEN | Unit | High |
| TC-PSI-25 | Error saat fetch chat | `chatRoom.findOne` throw Error | Call `getChatAsPsychologist()` | Throws FAILED_FETCH_MESSAGES | Unit | Low |
| TC-PSI-26 | Ambil chat berhasil | Room ditemukan, user participant, ada messages | Call `getChatAsPsychologist()` | Returns `{ statusCode: 200, data.length > 0 }` | Unit | High |
| TC-PSI-27 | Validasi struktur message | Room dengan 1 message lengkap | Call `getChatAsPsychologist()` | Message punya senderId, message, timestamp | Unit | Medium |
| TC-PSI-28 | Urutan pesan ascending by timestamp | Room dengan 2 pesan tidak berurutan | Call `getChatAsPsychologist()` | Pesan lebih awal ada di index 0 | Unit | Low |

#### Integration Tests - Chat Psikolog API

| ID | Scenario | Precondition | Steps | Expected Result | Type | Priority |
|---|---|---|---|---|---|---|
| TC-INT-CHAT-PSI-001 | Tanpa token (GET /rooms) | - | `GET /api/chat/rooms` tanpa token | HTTP 401 | Integration | High |
| TC-INT-CHAT-PSI-002 | Get rooms berhasil | Room milik psikolog ada | `GET /api/chat/rooms` dengan token psikolog | HTTP 200 + array | Integration | High |
| TC-INT-CHAT-PSI-003 | Get rooms kosong | Psikolog baru tanpa room | `GET /api/chat/rooms` dengan token psikolog baru | HTTP 200 + array kosong | Integration | Medium |
| TC-INT-CHAT-PSI-004 | Hanya room milik psikolog ini | Room milik psikolog lain ada | `GET /api/chat/rooms` dengan token psikolog | Room milik psikolog lain tidak ada di response | Integration | High |
| TC-INT-CHAT-PSI-005 | Tanpa token (GET /messages) | - | `GET /api/chat/messages/:roomId` tanpa token | HTTP 401 | Integration | High |
| TC-INT-CHAT-PSI-006 | Room tidak ditemukan | - | `GET /api/chat/messages/:fakeRoomId` dengan token psikolog | HTTP 404 | Integration | Medium |
| TC-INT-CHAT-PSI-007 | Get messages berhasil | Room milik psikolog ada | `GET /api/chat/messages/:roomId` dengan token psikolog | HTTP 200 + array | Integration | High |
| TC-INT-CHAT-PSI-008 | Akses room bukan milik psikolog | Room milik psikolog lain | `GET /api/chat/messages/:foreignRoomId` dengan token psikolog | HTTP 403 | Integration | High |
| TC-INT-CHAT-PSI-010 | Tanpa field wajib (POST /messages) | Token psikolog valid | `POST /api/chat/messages` dengan body `{}` | HTTP 400 | Integration | High |
| TC-INT-CHAT-PSI-011 | Send message berhasil | Room aktif milik psikolog | `POST /api/chat/messages` dengan roomId, senderId, message | HTTP 201 | Integration | High |
| TC-INT-CHAT-PSI-012 | Pesan tidak disimpan ke DB | Room ada | `POST /api/chat/messages` dengan message valid | Pesan tidak ada di `room.messages` di DB | Integration | Medium |
| TC-INT-CHAT-PSI-015 | Message terlalu panjang | Room aktif | `POST /api/chat/messages` dengan message 1001 karakter | HTTP 413 | Integration | Medium |
| TC-INT-CHAT-PSI-016 | Message mengandung script | Room aktif | `POST /api/chat/messages` dengan `message: "<script>alert(1)</script>"` | HTTP 400 | Integration | Medium |
| TC-INT-CHAT-PSI-017 | Tanpa token (PATCH /finish) | - | `PATCH /api/chat/finish/:roomId` tanpa token | HTTP 401 | Integration | High |
| TC-INT-CHAT-PSI-018 | Room tidak ditemukan (finish) | - | `PATCH /api/chat/finish/:fakeId` dengan token psikolog | HTTP 404 | Integration | Medium |
| TC-INT-CHAT-PSI-019 | Finish chat berhasil | Room aktif milik psikolog | `PATCH /api/chat/finish/:roomId` dengan token psikolog | HTTP 200 + `room.status` = "inactive" di DB | Integration | High |
| TC-INT-CHAT-PSI-020 | Finish idempotent | Finish 2 kali | `PATCH /api/chat/finish/:roomId` dua kali | HTTP 200 + status tetap "inactive" | Integration | Low |
| TC-INT-CHAT-PSI-021 | Get messages setelah finish | Room inactive | `GET /api/chat/messages/:roomId` setelah finish | HTTP 200 | Integration | Low |
| TC-INT-CHAT-PSI-022 | Kirim message ke room inactive | Room inactive | `POST /api/chat/messages` ke room inactive | HTTP 201 atau 400 (tergantung controller) | Integration | Low |

---

## Article

### Article Admin

#### Unit Tests - Article Admin Service

| ID | Scenario | Precondition | Steps | Expected Result | Type | Priority |
|---|---|---|---|---|---|---|
| TC-ADM-ART-01 | formatArticle dengan input null | - | Call `formatArticle(null)` | Returns null | Unit | Medium |
| TC-ADM-ART-02 | formatArticle tanpa fullname | Artikel tanpa profile.fullname | Call `formatArticle()` dengan writer tanpa fullname | `result.writer.fullname` = "Unknown" | Unit | Low |
| TC-ADM-ART-03 | formatArticle data lengkap | Artikel valid | Call `formatArticle()` dengan data lengkap | Returns `{ id, writer: { id, fullname } }` sesuai format | Unit | Medium |
| TC-ADM-ART-04 | getAllArticles tidak ada data | `ArticleModel.find` returns [] | Call `getAllArticles()` | Returns [] | Unit | Medium |
| TC-ADM-ART-05 | getAllArticles ada data | `ArticleModel.find` returns list | Call `getAllArticles()` | Returns list artikel | Unit | High |
| TC-ADM-ART-06 | getArticleById dengan ID invalid | - | Call `getArticleById("invalid")` | Throws 400 + "ID tidak valid" | Unit | High |
| TC-ADM-ART-07 | getArticleById tidak ditemukan | `findById` returns null | Call `getArticleById()` dengan ObjectId valid | Throws 404 | Unit | High |
| TC-ADM-ART-08 | getArticleById valid | `findById` returns artikel | Call `getArticleById()` dengan ID valid | Returns artikel | Unit | High |
| TC-ADM-ART-09 | createArticleRecord tanpa title | - | Call `createArticleRecord()` dengan `title: ""` | Throws 400 + "Title tidak boleh kosong" | Unit | High |
| TC-ADM-ART-10 | createArticleRecord slug duplikat | `findOne` returns existing artikel | Call `createArticleRecord()` dengan title yang menghasilkan slug duplikat | Throws 409 | Unit | Medium |
| TC-ADM-ART-11 | createArticleRecord valid | Tidak ada duplikat slug | Call `createArticleRecord()` dengan title dan content valid | Returns defined result | Unit | High |
| TC-ADM-ART-12 | Slug normalization | Tidak ada duplikat slug | Call `createArticleRecord()` dengan title `"TEST   Title!!"` | Slug tersimpan sebagai "test-title" | Unit | Medium |
| TC-ADM-ART-13 | updateArticleRecord ID invalid | - | Call `updateArticleRecord()` dengan `articleId: "invalid"` | Throws 400 | Unit | High |
| TC-ADM-ART-14 | updateArticleRecord tidak ditemukan | `findById` returns null | Call `updateArticleRecord()` dengan valid ID | Throws 404 | Unit | High |
| TC-ADM-ART-15 | updateArticleRecord title kosong (whitespace) | Artikel ditemukan | Call `updateArticleRecord()` dengan `title: "   "` | Throws 400 | Unit | Medium |
| TC-ADM-ART-16 | updateArticleRecord berhasil | Artikel ditemukan | Call `updateArticleRecord()` dengan `title: "New Title"` | `article.slug` = "new-title" | Unit | High |
| TC-ADM-ART-17 | deleteArticleRecord ID invalid | - | Call `deleteArticleRecord("invalid")` | Throws 400 | Unit | High |
| TC-ADM-ART-18 | deleteArticleRecord tidak ditemukan | `findByIdAndDelete` returns null | Call `deleteArticleRecord()` dengan valid ID | Throws 404 | Unit | High |
| TC-ADM-ART-19 | deleteArticleRecord berhasil | `findByIdAndDelete` returns artikel | Call `deleteArticleRecord()` dengan ID valid | Returns defined result | Unit | High |
| TC-ADM-ART-20 | updateOwnedArticleRecord bukan pemilik | `findOne` returns null | Call `updateOwnedArticleRecord()` dengan writerId berbeda | Throws 401 | Unit | High |
| TC-ADM-ART-21 | deleteOwnedArticleRecord bukan pemilik | `findOneAndDelete` returns null | Call `deleteOwnedArticleRecord()` dengan writerId berbeda | Throws 401 | Unit | High |

#### Integration Tests - Article Admin API

| ID | Scenario | Precondition | Steps | Expected Result | Type | Priority |
|---|---|---|---|---|---|---|
| TC-INT-ADM-05 | Create artikel tanpa token | - | `POST /api/admin/articles` tanpa token | HTTP 401 | Integration | High |
| TC-INT-ADM-06 | Create artikel role bukan admin | Token mahasiswa valid | `POST /api/admin/articles` dengan token mahasiswa | HTTP 403 | Integration | High |
| TC-INT-ADM-09 | Create artikel tanpa title | Token admin valid | `POST /api/admin/articles` tanpa field title | HTTP 400 | Integration | High |
| TC-INT-ADM-10 | Create artikel tanpa content | Token admin valid | `POST /api/admin/articles` tanpa field content | HTTP 400 | Integration | High |
| TC-INT-ADM-13 | Create artikel valid | Token admin valid | `POST /api/admin/articles` dengan title dan content | HTTP 201 + `data` defined | Integration | High |
| TC-INT-ADM-14 | Get semua artikel | Token admin valid | `GET /api/admin/articles` dengan token admin | HTTP 200 + `data` adalah array | Integration | High |
| TC-INT-ADM-15 | Get artikel by ID valid | Artikel ada di DB | `GET /api/admin/articles/:id` dengan ID valid | HTTP 200 + `data` defined | Integration | High |
| TC-INT-ADM-01 | Update artikel ID tidak ditemukan | Token admin valid | `PUT /api/admin/articles/:fakeId` | HTTP 404 | Integration | Medium |
| TC-INT-ADM-03 | Get artikel ID tidak ditemukan | Token admin valid | `GET /api/admin/articles/:fakeId` | HTTP 404 | Integration | Medium |
| TC-INT-ADM-04 | Get artikel ID invalid | Token admin valid | `GET /api/admin/articles/invalid-id` | HTTP 400 | Integration | Medium |
| TC-INT-ADM-16 | Update artikel valid | Artikel ada di DB, token admin valid | `PUT /api/admin/articles/:id` dengan title dan content | HTTP 200 | Integration | High |
| TC-INT-ADM-17 | Update hanya title — slug ikut berubah | Artikel ada di DB, token admin valid | `PUT /api/admin/articles/:id` dengan title baru | HTTP 200 | Integration | Medium |
| TC-INT-ADM-18 | Update hanya content | Artikel ada di DB, token admin valid | `PUT /api/admin/articles/:id` dengan content baru | HTTP 200 | Integration | Medium |
| TC-INT-ADM-11 | Update tanpa field — data tetap | Artikel ada di DB, token admin valid | `PUT /api/admin/articles/:id` dengan body `{}` | HTTP 200 | Integration | Low |
| TC-INT-ADM-19 | Delete artikel valid | Artikel ada di DB, token admin valid | `DELETE /api/admin/articles/:id` | HTTP 200 | Integration | High |
| TC-INT-ADM-02 | Delete artikel ID tidak ditemukan | Token admin valid | `DELETE /api/admin/articles/:fakeId` | HTTP 404 | Integration | Medium |
| TC-INT-ADM-08 | Delete artikel tanpa token | - | `DELETE /api/admin/articles/:id` tanpa token | HTTP 401 | Integration | High |
| TC-INT-ADM-12 | Delete artikel dua kali | Artikel ada lalu dihapus | `DELETE /api/admin/articles/:id` dua kali | Delete kedua HTTP 404 | Integration | Medium |
| TC-INT-ADM-20 | Slug otomatis terbentuk saat create | Token admin valid | `POST /api/admin/articles` dengan title valid | `res.body.data.slug` defined | Integration | Medium |
| TC-INT-ADM-21 | Slug berubah saat update title | Artikel ada di DB | `PUT /api/admin/articles/:id` dengan title baru | HTTP 200 | Integration | Medium |
| TC-INT-ADM-22 | Format response sesuai struktur | Token admin valid, artikel ada | `GET /api/admin/articles` | `data[0]` punya field `title` dan `slug` | Integration | Low |

---

### Article Psikolog

#### Unit Tests - Article Psikolog Service

| ID | Scenario | Precondition | Steps | Expected Result | Type | Priority |
|---|---|---|---|---|---|---|
| TC-PSI-ART-10 | formatArticle null | - | Call `formatArticle(null)` | Returns null | Unit | Low |
| TC-PSI-ART-11 | formatArticle missing fullname | Artikel dengan writer.profile tanpa fullname | Call `formatArticle()` | `writer.fullname` = "Unknown" | Unit | Low |
| TC-PSI-ART-22 | formatArticle data valid | Artikel valid | Call `formatArticle()` dengan data lengkap | Returns `{ title, slug, writer: { id } }` | Unit | Medium |
| TC-PSI-ART-19 | getAllArticles — list returned | `find` returns list | Call `getAllArticles()` | `result.length > 0` | Unit | High |
| TC-PSI-ART-03 | getArticleById ID invalid | - | Call `getArticleById("123")` | Throws 400 + "ID tidak valid" | Unit | High |
| TC-PSI-ART-12 | getArticleById tidak ditemukan | `findById` returns null | Call `getArticleById()` dengan valid ID | Throws 404 + "Artikel tidak ditemukan" | Unit | Medium |
| TC-PSI-ART-18 | getArticleById valid | `findById` returns artikel | Call `getArticleById()` dengan ID valid | Returns defined result | Unit | High |
| TC-PSI-ART-07 | createArticleRecord tanpa title | - | Call `createArticleRecord()` dengan `title: ""` | Throws 400 + "Title tidak boleh kosong" | Unit | High |
| TC-PSI-ART-08 | createArticleRecord tanpa thumbnail — tetap berhasil | Tidak ada duplikat slug | Call `createArticleRecord()` tanpa thumbnail | Returns defined result | Unit | Medium |
| TC-PSI-ART-13 | createArticleRecord valid | Tidak ada duplikat slug | Call `createArticleRecord()` dengan data valid | Returns defined result | Unit | High |
| TC-PSI-ART-20 | Slug dibuat dalam format lowercase-dash | Tidak ada duplikat slug | Call `createArticleRecord()` dengan title "Valid Title" | `result.slug` defined (slug terbentuk) | Unit | Medium |
| TC-PSI-ART-09 | updateArticleRecord tanpa payload | Artikel ditemukan | Call `updateArticleRecord()` tanpa field update | Returns defined result | Unit | Low |
| TC-PSI-ART-15 | updateArticleRecord update title — slug berubah | Artikel ditemukan | Call `updateArticleRecord()` dengan `title: "New Title"` | `result.title` defined | Unit | Medium |
| TC-PSI-ART-16 | updateArticleRecord update content saja | Artikel ditemukan | Call `updateArticleRecord()` dengan `content: "New Content"` | `result.content` defined | Unit | Medium |
| TC-PSI-ART-21 | Slug reflect title baru | Artikel ditemukan | Call `updateArticleRecord()` dengan title "Updated Title" | `result.slug` defined | Unit | Low |
| TC-PSI-ART-01 | updateOwnedArticleRecord bukan pemilik | `findOne` returns null | Call `updateOwnedArticleRecord()` dengan writerId berbeda | Throws 401 + "Unauthorized to edit this article" | Unit | High |
| TC-PSI-ART-05 | updateOwnedArticleRecord ID invalid | - | Call `updateOwnedArticleRecord()` dengan `articleId: "123"` | Throws 400 + "ID tidak valid" | Unit | High |
| TC-PSI-ART-14 | updateOwnedArticleRecord berhasil | `findOne` returns artikel, `findById` returns same | Call `updateOwnedArticleRecord()` dengan writerId yang benar | Returns defined result | Unit | High |
| TC-PSI-ART-04 | deleteArticleRecord tidak ditemukan | `findByIdAndDelete` returns null | Call `deleteArticleRecord()` dengan valid ID | Throws 404 + "Artikel tidak ditemukan" | Unit | High |
| TC-PSI-ART-06 | deleteArticleRecord dua kali | Delete pertama berhasil, kedua returns null | Call `deleteArticleRecord()` dua kali dengan ID sama | Delete kedua throws 404 + "Artikel tidak ditemukan" | Unit | Medium |
| TC-PSI-ART-17 | deleteArticleRecord berhasil | `findByIdAndDelete` returns artikel | Call `deleteArticleRecord()` dengan ID valid | Returns defined result | Unit | High |
| TC-PSI-ART-02 | deleteOwnedArticleRecord bukan pemilik | `findOneAndDelete` returns null | Call `deleteOwnedArticleRecord()` dengan writerId berbeda | Throws 401 + "Unauthorized to delete this article" | Unit | High |

#### Integration Tests - Article Psikolog API

| ID | Scenario | Precondition | Steps | Expected Result | Type | Priority |
|---|---|---|---|---|---|---|
| TC-INT-PSI-01 | Update bukan milik sendiri | Artikel milik psikolog lain | `PUT /api/psikolog/articles/:id` dengan token psikolog yang bukan owner | HTTP 401 | Integration | High |
| TC-INT-PSI-02 | Delete bukan milik sendiri | Artikel milik psikolog lain | `DELETE /api/psikolog/articles/:id` dengan token psikolog yang bukan owner | HTTP 401 | Integration | High |
| TC-INT-PSI-03 | Update artikel tidak ditemukan | Token psikolog valid | `PUT /api/psikolog/articles/:fakeId` | HTTP 401 atau 404 | Integration | Medium |
| TC-INT-PSI-04 | Delete artikel tidak ditemukan | Token psikolog valid | `DELETE /api/psikolog/articles/:fakeId` | HTTP 401 atau 404 | Integration | Medium |
| TC-INT-PSI-05 | Create tanpa token | - | `POST /api/psikolog/articles` tanpa token | HTTP 401 | Integration | High |
| TC-INT-PSI-06 | Update tanpa token | - | `PUT /api/psikolog/articles/:id` tanpa token | HTTP 401 | Integration | High |
| TC-INT-PSI-07 | Delete tanpa token | - | `DELETE /api/psikolog/articles/:id` tanpa token | HTTP 401 | Integration | High |
| TC-INT-PSI-08 | Create tanpa title | Token psikolog valid | `POST /api/psikolog/articles` dengan `{ content: "B" }` | HTTP 400 | Integration | High |
| TC-INT-PSI-09 | Create tanpa content | Token psikolog valid | `POST /api/psikolog/articles` dengan `{ title: "A" }` | HTTP 400 | Integration | High |
| TC-INT-PSI-10 | Update dengan ID invalid | Token psikolog valid | `PUT /api/psikolog/articles/invalid-id` | HTTP 400 | Integration | Medium |
| TC-INT-PSI-12 | Get artikel tidak ditemukan | Token admin valid | `GET /api/admin/articles/:fakeId` | HTTP 404 | Integration | Medium |
| TC-INT-PSI-11 | Delete artikel dua kali | Artikel milik psikolog ada | `DELETE /api/psikolog/articles/:id` dua kali | Delete kedua HTTP 404 atau 401 | Integration | Medium |
| TC-INT-PSI-13 | Create artikel valid | Token psikolog valid | `POST /api/psikolog/articles` dengan title dan content | HTTP 201 | Integration | High |
| TC-INT-PSI-14 | Update milik sendiri | Artikel milik psikolog ini | `PUT /api/psikolog/articles/:id` dengan title baru | HTTP 200 | Integration | High |
| TC-INT-PSI-15 | Update title — slug berubah | Artikel milik psikolog ini | `PUT /api/psikolog/articles/:id` dengan title "New Title" | HTTP 200 + `data.slug` = "new-title" | Integration | Medium |
| TC-INT-PSI-16 | Update content saja | Artikel milik psikolog ini | `PUT /api/psikolog/articles/:id` dengan content baru | HTTP 200 | Integration | Medium |
| TC-INT-PSI-17 | Delete milik sendiri | Artikel milik psikolog ini | `DELETE /api/psikolog/articles/:id` | HTTP 200 | Integration | High |
| TC-INT-PSI-18 | Get artikel by ID | Artikel ada di DB | `GET /api/admin/articles/:id` dengan token admin | HTTP 200 | Integration | High |
| TC-INT-PSI-19 | Get semua artikel | Artikel ada di DB | `GET /api/admin/articles` dengan token admin | HTTP 200 + `data` adalah array | Integration | High |
| TC-INT-PSI-20 | Slug terbentuk otomatis | Token psikolog valid | `POST /api/psikolog/articles` dengan title "Hello World" | `res.body.data.slug` = "hello-world" | Integration | Medium |
| TC-INT-PSI-21 | Slug update saat title berubah | Artikel milik psikolog ada | `PUT /api/psikolog/articles/:id` dengan title "Updated Title" | `res.body.data.slug` = "updated-title" | Integration | Medium |
| TC-INT-PSI-22 | Format response valid | Token psikolog valid | `POST /api/psikolog/articles` dengan title dan content | `data` punya id, title, slug, writer | Integration | Medium |

---

## Chatbot

### Chatbot Service

#### Unit Tests - Chatbot Service

| ID | Scenario | Precondition | Steps | Expected Result | Type | Priority |
|---|---|---|---|---|---|---|
| TC-CHATBOT-SVC-01 | Messages undefined | `fetch` di-mock, API key ada | Call `sendChatToGroq(undefined)` | Throws 400 + "Messages is required" | Unit | High |
| TC-CHATBOT-SVC-02 | Messages bukan array | `fetch` di-mock, API key ada | Call `sendChatToGroq("invalid")` | Throws 400 + "Messages must be an array" | Unit | High |
| TC-CHATBOT-SVC-03 | Messages array kosong — call API | `fetch` mock returns OK | Call `sendChatToGroq([])` | `fetch` dipanggil + Returns `{ role: "assistant", content: "OK" }` | Unit | Medium |
| TC-CHATBOT-SVC-04 | GROQ berhasil — return assistant reply | `fetch` mock returns OK | Call `sendChatToGroq([{ role: "user", content: "Halo" }])` | Returns `{ role: "assistant", content: "Test reply" }` | Unit | High |
| TC-CHATBOT-SVC-05 | Response tanpa content — default message | `fetch` mock returns `choices: [{}]` | Call `sendChatToGroq()` dengan 1 message | `result.content` = "Maaf, tidak ada respons dari model." | Unit | Medium |
| TC-CHATBOT-SVC-06 | Response non-200 dari GROQ | `fetch` mock returns `ok: false` | Call `sendChatToGroq()` dengan 1 message | Throws "Chatbot service failed" | Unit | High |
| TC-CHATBOT-SVC-07 | Fetch error (network error) | `fetch` mock throw Error | Call `sendChatToGroq()` dengan 1 message | Throws "Chatbot service failed" | Unit | High |
| TC-CHATBOT-SVC-08 | Payload benar — system + user message terkirim | `fetch` mock returns OK | Call `sendChatToGroq([{ role: "user", content: "Test" }])` | Body request mengandung system message dan user message | Unit | Medium |
| TC-CHATBOT-SVC-09 | System prompt selalu di index pertama | `fetch` mock returns OK | Call `sendChatToGroq()` dengan 1 user message | `body.messages[0].role` = "system" | Unit | Medium |
| TC-CHATBOT-SVC-10 | API key digunakan di Authorization header | `fetch` mock returns OK, env key set | Call `sendChatToGroq()` dengan 1 message | `headers.Authorization` = "Bearer test-api-key" | Unit | High |
| TC-CHATBOT-SVC-11 | Response panjang tidak terpotong | `fetch` mock returns content 1000 karakter | Call `sendChatToGroq()` dengan 1 message | `result.content.length` = 1000 | Unit | Low |
| TC-CHATBOT-SVC-12 | Multiple messages — semua history terkirim | `fetch` mock returns OK | Call `sendChatToGroq()` dengan 3 messages | `body.messages.length` = 4 (3 + 1 system) | Unit | Medium |
| TC-CHATBOT-SVC-13 | Role invalid — tetap dikirim ke API | `fetch` mock returns OK | Call `sendChatToGroq()` dengan `role: "invalid"` | Body mengandung message dengan role "invalid" | Unit | Low |
| TC-CHATBOT-SVC-14 | Response tidak valid — fallback default | `fetch` mock returns unexpected structure | Call `sendChatToGroq()` dengan 1 message | `result.content` = "Maaf, tidak ada respons dari model." | Unit | Medium |

#### Integration Tests - Chatbot API

| ID | Scenario | Precondition | Steps | Expected Result | Type | Priority |
|---|---|---|---|---|---|---|
| TC-CHATBOT-INT-01 | Messages undefined — return 400 | `sendChatToGroq` di-mock | `POST /api/chatbot/chat` dengan body `{}` | HTTP 400 + message "Messages is required" | Integration | High |
| TC-CHATBOT-INT-02 | Messages valid — return assistant reply | `sendChatToGroq` mock returns assistant reply | `POST /api/chatbot/chat` dengan `messages: [{ role: "user", content: "Halo" }]` | HTTP 200 + `data` = `{ role: "assistant", content: "Test reply" }` | Integration | High |
| TC-CHATBOT-INT-03 | Service error — propagate | `sendChatToGroq` mock throw 500 | `POST /api/chatbot/chat` dengan messages valid | HTTP 500 + message "Chatbot service failed" | Integration | High |
| TC-CHATBOT-INT-04 | Format response — contains status and data | `sendChatToGroq` mock returns OK | `POST /api/chatbot/chat` dengan messages valid | HTTP 200 + `status` = "success" + `data` ada | Integration | Medium |
| TC-CHATBOT-INT-05 | Multiple messages — success | `sendChatToGroq` mock returns OK | `POST /api/chatbot/chat` dengan 3 messages | HTTP 200 + `data.role` = "assistant" | Integration | Medium |
| TC-CHATBOT-INT-06 | Empty content dari service — tetap valid | `sendChatToGroq` mock returns default fallback | `POST /api/chatbot/chat` dengan messages valid | HTTP 200 + `data.content` = "Maaf, tidak ada respons dari model." | Integration | Low |
