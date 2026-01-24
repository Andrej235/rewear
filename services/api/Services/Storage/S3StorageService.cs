using Amazon.S3;
using Amazon.S3.Model;

namespace ReWear.Services.Storage;

public class S3StorageService(IAmazonS3 s3Client, IConfiguration configuration) : IStorageService
{
    private readonly IAmazonS3 s3Client = s3Client;
    private readonly string bucketName =
        configuration["AWS:BucketName"]
        ?? throw new ArgumentNullException("AWS:BucketName missing in configuration");

    private readonly string region =
        configuration["AWS:Region"]
        ?? throw new ArgumentNullException("AWS:Region missing in configuration");

    public async Task<string> SaveAsync(string key, Stream fileStream, string contentType)
    {
        var putRequest = new PutObjectRequest
        {
            BucketName = bucketName,
            Key = key,
            InputStream = fileStream,
            ContentType = contentType,
        };

        await s3Client.PutObjectAsync(putRequest);
        return key;
    }

    public Task<string> GetSignedUrlAsync(string key, TimeSpan? expiresIn = null)
    {
        var request = new GetPreSignedUrlRequest
        {
            BucketName = bucketName,
            Key = key,
            Expires = DateTime.UtcNow.Add(expiresIn ?? TimeSpan.FromMinutes(10)),
        };

        string url = s3Client.GetPreSignedURL(request);
        return Task.FromResult(url);
    }

    public Task<string> GetPublicUrlAsync(string key, TimeSpan? expiresIn = null)
    {
        return Task.FromResult($"https://{bucketName}.s3.{region}.amazonaws.com/{key}");
    }

    public async Task DeleteAsync(string key)
    {
        var deleteRequest = new DeleteObjectRequest { BucketName = bucketName, Key = key };

        try
        {
            await s3Client.DeleteObjectAsync(deleteRequest);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error deleting objects: {ex.Message}");
            throw;
        }
    }
}
