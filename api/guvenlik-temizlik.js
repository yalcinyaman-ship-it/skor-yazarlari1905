// BİR KEZ çalıştır: kullanıcı kayıtlarındaki açık "pin" alanlarını ve eski API anahtarını siler.
// Veri kaybı yok: puanlar, tahminler, maçlar etkilenmez.
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "./_firebase.js";

export default async function handler(req, res) {
  if ((req.query || {}).onay !== "evet") {
    return res.status(200).json({ bilgi: "Çalıştırmak için adresin sonuna ?onay=evet ekle." });
  }
  try {
    const db = adminDb();
    const users = await db.collection("users").get();
    const batch = db.batch();
    let pin = 0;
    users.docs.forEach((u) => { if (u.data().pin !== undefined) { batch.update(u.ref, { pin: FieldValue.delete() }); pin++; } });
    batch.delete(db.doc("integrations/apiFootball"));
    await batch.commit();
    res.status(200).json({ tamam: true, pinSilinenKullanici: pin, apiAnahtariSilindi: true });
  } catch (e) {
    res.status(200).json({ hata: String(e && e.message ? e.message : e) });
  }
}
