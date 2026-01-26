using Microsoft.AspNetCore.Identity;
using ReWear.Models.Enums;

namespace ReWear.Models;

public class User : IdentityUser
{
    public Gender Gender { get; set; }

    public Style PrimaryStyle { get; set; }
    public Style SecondaryStyles { get; set; }

    public Season SeasonPreference { get; set; }

    public Color PreferredColors { get; set; }
    public Color AvoidedColors { get; set; }

    public Fit FitPreference { get; set; }

    public ICollection<UserSize> Sizes { get; set; } = [];

    public Material AvoidedMaterials { get; set; }

    public DateTime CreatedAt { get; set; }

    public ICollection<DeliveryBox> DeliveryBoxes { get; set; } = [];
    public ICollection<UserSubscription> Subscriptions { get; set; } = [];
}
