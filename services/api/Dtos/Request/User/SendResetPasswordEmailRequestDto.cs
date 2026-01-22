using System.ComponentModel.DataAnnotations;

namespace Template.Dtos.Request.User;

public class SendResetPasswordEmailRequestDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;
}
