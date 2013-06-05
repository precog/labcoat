package labcoat.module.view.fstreeview;

class MimeType {
    public static function fromName(filename: String): String {
        var extension = filename.split('.').pop();
        return fromExtension(extension);
    }

    public static function fromExtension(extension: String) {
        return switch(extension) {
        case 'json':
            'application/json';
        case 'md':
            'text/x-markdown';
        case 'markdown':
            'text/x-markdown';
        case 'qrl':
            'text/x-quirrel-script';
        default:
            'text/plain';
        }
    }
}
