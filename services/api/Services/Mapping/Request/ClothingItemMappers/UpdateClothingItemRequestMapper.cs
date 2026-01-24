using ReWear.Dtos.Request.ClothingItem;
using ReWear.Models;

namespace ReWear.Services.Mapping.Request.ClothingItemMappers;

public class UpdateClothingItemRequestMapper
    : IRequestMapper<UpdateClothingItemRequestDto, ClothingItem>
{
    public ClothingItem Map(UpdateClothingItemRequestDto from) =>
        new()
        {
            Id = from.Id,
            Name = from.Name,
            Description = from.Description,

            Category = from.Category,
            GenderTarget = from.GenderTarget,

            PrimaryStyle = from.PrimaryStyle,
            SecondaryStyles = from.SecondaryStyles,

            Colors = from.Colors,
            FitType = from.FitType,
            Season = from.Season,

            Material = from.Material,
            BrandName = from.BrandName,

            IsActive = from.IsActive,
        };
}
