# මුදල් ඩයරිය — Android App

Meka oyage "mudal-diary" React app eka, phone eke APK ekak widihata daanna converted karapu project ekak.

## Mokakda venuma karapu (mokada meka wenas kalada)

1. Claude artifact ekේ තිබුණු `window.storage` API එක - eka artifact chat ekaka witharai wada karanne, phone app ekaka wada karanne na. Ee nisa eeka venuwata **phone eke localStorage** eken save/load karana `src/storage.js` file eka ekathu kala. Transactions, categories, target - okkoma phone eke thani wela save wenawa (internet ekak ona na, offline wada karanawa).
2. `App.jsx` eke `window.storage.get/set` calls wenuwata `storage.get/set` (aluth wrapper eka) use karanna wenas kala.
3. Capacitor kiyana tool ekak add kala - meka thamai React/HTML web app ekak gaththoth eeka real Android APK ekak bawata pat karana eka.
4. GitHub Actions workflow ekak (`.github/workflows/build-apk.yml`) ekathu kala - meka nisa **oyage phone/computer eke Android Studio install karanna one na**. GitHub eke server ekaka thamai APK eka automatically build wenne.

## Karanna one steps (podi vidiyakata)

### 1. Meya GitHub repo ekakata danna
- github.com ekata gihin aluth repository ekak hadanna (public or private, oyata one widiyak).
- Meya download karapu zip file eka extract karala, ehema tiyena files okkoma push karanna:

```bash
git init
git add .
git commit -m "mudal diary app"
git branch -M main
git remote add origin https://github.com/<oyage-username>/<repo-name>.git
git push -u origin main
```

(Terminal ekak nathnam, GitHub website ekenma "Add file → Upload files" kara try karanna puluwan, ithin folder structure ekama tියenna one.)

### 2. Build eka automatic wenawa
- Push karapu ude, GitHub repo eke **Actions** tab eka check karanna. "Build Android APK" workflow eka run wenawa (5-10 minutes vගේ yanna puluwan).
- Eka success unama, eka workflow run ekata yanna, pahalata "Artifacts" section eke **mudal-diary-apk** kiyana file eka thiyenawa - eka download karanna. Eka `.zip` ekak widihata download wei, eeka open kalama athule `app-debug.apk` eka thiyei.

### 3. Phone ekata dagena install karanna
- APK file eka phone ekata copy karanna (email, Google Drive, USB - okkoma OK).
- Phone eke Settings → "Install unknown apps" wagey option ekak enable karanna one (Android security setting ekak, debug APK ekak nisa).
- APK eka tap karala install karanna.

## Podi note ekak

- Meka "debug" APK ekak - test karanna/danna hondai. Play Store ekata publish karanna nam, "release" build ekak (signed) hadanna one - eeka one welawaka kiyanna, eka setup karanna help karannam.
- App eke font eka (Noto Sans Sinhala) Google Fonts eken load wenne, ee nisa palamu weLāwe app eka open karaddi internet ekak one wei. Aluthin oyata one nam, font eka app eke ma bundle karala full offline karanna puluwan - ehema karanna one nam kiyanna.
- App icon eka default Capacitor icon ekak witharai dan tiyenne. Oyata custom icon ekak one nam (mudal/wallet icon wagey ekak), image ekak dunnoth mama danna puluwan.
