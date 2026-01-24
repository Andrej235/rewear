using FluentResults;

namespace ReWear.Services.ModelServices.ClothingItemService;

public partial class ClothingItemService
{
    public Task<Result> Delete(Guid id) => deleteService.Delete(x => x.Id == id);
}
