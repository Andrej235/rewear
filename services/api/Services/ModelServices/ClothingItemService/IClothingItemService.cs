using System.Security.Claims;
using FluentResults;
using ReWear.Dtos.Request.ClothingItem;
using ReWear.Dtos.Response.ClothingItem;

namespace ReWear.Services.ModelServices.ClothingItemService;

public interface IClothingItemService
{
    Task<Result<AdminClothingItemResponseDto>> Create(CreateClothingItemRequestDto request);

    Task<Result<AdminClothingItemResponseDto>> GetById(
        Guid id,
        CancellationToken cancellationToken
    );
    Task<Result<IEnumerable<AdminClothingItemResponseDto>>> GetAll(
        CancellationToken cancellationToken
    );
    Task<Result<IEnumerable<ClothingItemPreviewResponseDto>>> GetPreviews(
        ClaimsPrincipal userClaims,
        GetClothingItemFiltersRequestDto filters,
        CancellationToken ct
    );

    Task<Result> Update(UpdateClothingItemRequestDto request);
    Task<Result> UpdateImage(Guid id, IFormFile imageStream);

    Task<Result> Delete(Guid id);
}
