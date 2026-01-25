using FluentResults;

namespace ReWear.Services.ModelServices.ClothingItemService;

public partial class ClothingItemService
{
    public async Task<Result> Delete(Guid id)
    {
        var result = await deleteService.Delete(x => x.Id == id);

        try
        {
            await storageService.DeleteAsync($"clothing-items/{id}");
        }
        catch (Exception e)
        {
            return result.WithError(
                new Error(
                    "Clothing item deleted, but failed to delete image from storage."
                ).CausedBy(e)
            );
        }

        return result;
    }
}
