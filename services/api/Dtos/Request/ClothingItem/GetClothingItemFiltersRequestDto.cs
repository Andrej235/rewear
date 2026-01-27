using System.ComponentModel.DataAnnotations;
using ReWear.Models.Enums;

namespace ReWear.Dtos.Request.ClothingItem;

public class GetClothingItemFiltersRequestDto
{
    public string? Name { get; set; }
    public ICollection<ClothingCategory>? Categories { get; set; }
    public ICollection<GenderTarget>? Gender { get; set; }
    public ICollection<Color>? Colors { get; set; }
    public ICollection<Style>? Styles { get; set; }
    public ICollection<Fit>? FitTypes { get; set; }
    public Season? Season { get; set; }
    public ICollection<Material>? Materials { get; set; }
    public bool OnlyInStock { get; set; } = false;
    public bool Strict { get; set; } = false;

    [Range(0, int.MaxValue)]
    public int Offset { get; set; } = 0;

    [Range(1, 100)]
    public int Limit { get; set; } = 25;
}
