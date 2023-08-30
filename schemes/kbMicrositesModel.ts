const KBMicrositesSchema = {
  version: '1.0.0',
  indexes: {
    primary: { hash: 'pk', sort: 'sk' },
  },
  models: {
    Config: {
      pk: { type: String, value: 'Config#Config' },
      sk: { type: String, value: 'appUUID:${appUUID}' },
      id: { type: String, required: true },
      appUUID: { type: String, required: true },
      name: { type: String, required: true },
      photoProfile: { type: String, required: true },
      greeting: { type: String, required: false },
      description: { type: String, required: false },
      background: { type: String, required: true },
      initialPrice: { type: Number, required: false },
      finalPrice: { type: Number, required: false },
      currency: { type: String, required: false },
      address: { type: String, required: false },
      webSite: { type: String, required: false },
      urlKeybe: { type: String, required: false },
      socialLinks: { type: Array, required: false },
      whatsappKeybe: { type: String, required: true },
      published: { type: Boolean, required: false },
      createdAt: { type: String, required: false },
      updateAt: { type: String, required: false },
    },
    Categories: {
      pk: { type: String, value: 'Categories#Categories' },
      sk: { type: String, value: 'appUUID:${appUUID}#id:${id}' },
      id: { type: String, required: true },
      appUUID: { type: String, required: true },
      category: { type: String, required: true },
      published: { type: Boolean, required: false },
      createdAt: { type: String, required: false },
      updateAt: { type: String, required: false },
    },
    Products: {
      pk: { type: String, value: 'Products#Products' },
      sk: { type: String, value: 'appUUID:${appUUID}#id:${id}' },
      id: { type: String, required: true },
      appUUID: { type: String, required: true },
      category: { type: String, required: true },
      product: { type: String, required: true },
      price: { type: Number, required: false },
      currency: { type: String, required: false },
      checkColor: { type: Boolean, required: true },
      colors: { type: String, required: false },
      description: { type: String, required: true },
      images: { type: Array, required: true },
      published: { type: Boolean, required: false },
      createdAt: { type: String, required: false },
      updateAt: { type: String, required: false },
    },
    Catalogs: {
      pk: { type: String, value: 'Catalog#Catalog' },
      sk: { type: String, value: 'appUUID:${appUUID}#id:${id}' },
      id: { type: String, required: true },
      appUUID: { type: String, required: true },
      microsite: { type: Boolean, required: true },
      whatsapp: { type: Boolean, required: true },
      products: { type: Array, required: true },
      published: { type: Boolean, required: false },
      createdAt: { type: String, required: false },
      updateAt: { type: String, required: false },
    },
  },
};
export default KBMicrositesSchema;
