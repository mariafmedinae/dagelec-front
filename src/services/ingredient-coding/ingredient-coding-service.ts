import httpRequests from '../shared/http-requests';

// ----------------------------------------------------------------------

class IngredientService {
  getIngredient(data: any) {
    return httpRequests.post('/ingredient-coding/query', data);
  }

  createIngredient(data: any) {
    return httpRequests.post('/ingredient-coding', data);
  }

  updateIngredient(data: any) {
    return httpRequests.put('/ingredient-coding', data);
  }

  deleteIngredient(data: any) {
    return httpRequests.delete('/ingredient-coding', data);
  }
}

export default new IngredientService();
