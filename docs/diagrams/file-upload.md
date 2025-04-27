# Cloud file upload use case

> This is a file upload use case to the Cloudinary service

---

## Use case diagram

![File upload use case](../assets/imgs/use-case-file-upload.png)


## Component class diagram

```mermaid
---
Title: File Upload System Class Diagram
---
classDiagram
    class CloudinaryService {
        +uploadFile(File file) CloudResponse
        +deleteFile(string publicId) boolean
    }

    class CollectionRepository {
        -Model model
        +saveUrl(string documentId, string url) Document
        +getFileUrl(string documentId) string
        +deleteFileUrl(string documentId) boolean
        -handleDatabaseError(Error error) void
    }

    class FileService {
        -CollectionRepository collectionRepository
        -CloudinaryService cloudinaryService

        -validateSize(File file) boolean
        -validateExtension(File file) boolean
        -validate(File file) boolean
        -cloudUpload(File file) CloudResponse
        +upload(File file) UploadResult
        +deleteFile(string documentId, string publicId) boolean
    }

    class FileController {
        -FileService fileService
        +upload(Request req) Response
        +delete(Request req) Response
        -handleServiceError(Error error) Response
        -formatResponse(UploadResult result) Response
    }

    FileController "1" o-- "1" FileService
    FileService "1" o-- "1" CollectionRepository
    FileService "1" o-- "1" CloudinaryService
```

## Sequence diagram

```mermaid
sequenceDiagram
    title File Upload Flow
    actor User
    participant Controller
    participant Service
    participant Cloudinary
    participant Collections

    User ->> Controller: Send file
    Controller ->> Service: Upload file
    Service ->> Service: Validate file size
    break File too large
        Service -->> Controller: File too large error
        Controller -->> User: Cannot upload file.<br/>Error: file too large
    end
    Service ->> Service: Validate file extension
    break Invalid file extension
        Service -->> Controller: Invalid file extension error
        Controller -->> User: Cannot upload file.<br/>Error: invalid extension
    end
    Service ->> Cloudinary: Upload file
    alt Failed cloud upload
        Cloudinary -->> Service: Upload error
        Service -->> Controller: Cloud upload error
        Controller -->> User: Cannot upload file.<br/>Error: system unavailable
    else Successful cloud upload
        Cloudinary -->> Service: File URL and metadata
        Service ->> Collections: Save file URL
        alt URL persistence failed
            Collections -->> Service: URL saving error
            Service -->> Controller: URL saving error
            Controller -->> User: Cannot upload file.<br/>Error: system unavailable
        else Successful upload and persistece
            Collections -->> Service: Updated document
            Service -->> Controller: File upload success
            Controller -->> User: File upload success.<br/>Message: file URL
        end
    end
```

## Detailed sequence diagram of file upload API

This is a more detailed sequence diagram of the file upload API of the system with data provided.

```mermaid
sequenceDiagram
    title Detailed File Upload Flow
    actor User
    participant Controller
    participant Service
    participant Cloudinary
    participant Collections

    User ->> Controller: Send file
    Controller ->> Service: uploadFile(file)
    Service ->> Service: validateSize(file)
    break File too large
        Service -->> Controller: BadRequestException<br/>("File too large")
        Controller -->> User: HTTP 400 Bad request.<br/>Message: "File too large"
    end
    Service ->> Service: validateExtension(file)
    break Invalid file extension
        Service -->> Controller: BadRequestException<br/>("Invalid extension")
        Controller -->> User: HTTP 400 Bad request.<br/>Message: "Invalid extension"
    end
    Service ->> Cloudinary: upload(file)
    alt Failed cloud upload
        Cloudinary -->> Service: FileUploadException
        Service -->> Controller: InternalServerErrorException<br/>("Cannot upload file")
        Controller -->> User: HTTP 500 Internal server error.<br/>Message: "Cannot upload file"
    else Successful cloud upload
        Cloudinary -->> Service: Cloudinary API response
        Service ->> Collections: save(url)
        alt URL persistence failed
            Collections -->> Service: PersistenceError
            Service -->> Controller: InternalServerErrorException<br/>("Cannot save file URL")
            Controller -->> User: HTTP 500 Internal server error.<br/>Message: "Cannot save file URL"
        else Successful upload and persistece
            Collections -->> Service: UpdatedDocument
            Service -->> Controller: UpdatedDocument
            Controller -->> User: HTTP 200 Success.<br/>Body: UpdatedDocument
        end
    end
```

## Activity diagram

```mermaid
flowchart LR
    Start(( ))
    End((( )))

    A(Send file)
    B(Validate file)
    C{Is valid file}
    D[File validation error]
    E(Upload file)
    F{Is uploaded file}
    G[File upload error]
    H(Persist file URL)
    I{Is persisted file}
    J[Persistence error]
    K[File upload success]

    Start --> A
    A --> B
    B --> C
    C --False--> D
    D --> End
    C --True--> E
    E --> F
    F --False--> G
    G --> End
    F --True--> H
    H --> I
    I --False--> J
    J --> End
    I --True--> K
    K --> End
```
