# List Laptop Images

Retrieves a list of images for specific laptops. This is a public endpoint that does not require authentication.

## Endpoint

```
POST /catalog/laptops/images
```

## Authentication

Not required (public endpoint)

## Request Body

```json
{
  "laptopIds": ["string"]
}
```

## Response

**Status Code:** `200 OK`

```json
{
  "images": []
}
```

## Example Response

```json
{
  "images": [
    {
      "id": "image-id-1",
      "laptopId": "507f1f77bcf86cd799439011",
      "s3Url": "https://kuzco-images.s3.amazonaws.com/laptops/development/507f1f77bcf86cd799439011/1732448771677.jpg"
    },
    {
      "id": "image-id-2",
      "laptopId": "507f1f77bcf86cd799439011",
      "s3Url": "https://kuzco-images.s3.amazonaws.com/laptops/development/507f1f77bcf86cd799439011/1732448771777.jpg"
    }
  ]
}
```

