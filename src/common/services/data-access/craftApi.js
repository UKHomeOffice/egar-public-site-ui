class CraftApi {
  constructor(client) {
    this.client = client;
  }

  create(registration, craftType, craftBase, userId) {
    return this.client.post(`/user/${userId}/crafts`, {
      registration,
      craftType,
      craftBase,
    });
  }

  getDetails(userId, craftId) {
    return this.client.get(`/user/${userId}/crafts/${craftId}`);
  }

  getCrafts(userId, pageNumber) {
    return this.client.get(`/user/${userId}/crafts`, {
      query: { per_page: 5, page: pageNumber },
    });
  }

  getOrgCrafts(orgId, pageNumber) {
    return this.client.get(`/organisations/${orgId}/crafts`, {
      query: { per_page: 5, page: pageNumber },
    });
  }

  update(registration, craftType, craftBase, userId, craftId) {
    return this.client.put(`/user/${userId}/crafts/${craftId}`, {
      registration,
      craftType,
      craftBase,
    });
  }

  deleteCraft(requesterId, craftId) {
    return this.client.delete(`/user/${requesterId}/crafts/${craftId}`, {
      body: { requesterId, crafts: [{ craftId }] },
    });
  }

  deleteOrgCraft(orgId, requesterId, craftId) {
    return this.client.delete(`/organisations/${orgId}/crafts`, {
      body: { requesterId, crafts: [{ craftId }] },
    });
  }
}

module.exports = { CraftApi };
