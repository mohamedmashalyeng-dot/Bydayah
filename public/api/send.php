<?php
/**
 * يستقبل نموذجي الموقع (طلب الزواج والتواصل) ويرسلهما إلى بريد الفريق، ولا يخزّن أي بيانات.
 * العقد موضح في src/lib/submit.ts وفي README.
 */

declare(strict_types=1);

const MAIL_TO = 'bidaya456@gmail.com';
const MAIL_FROM = 'no-reply@bidayatzawaj.com';
const MAIL_FROM_NAME = 'موقع بداية';

const FORMS = [
    'apply' => 'طلب زواج جديد',
    'contact' => 'رسالة جديدة من الموقع',
];

const MAX_BODY_BYTES = 65536;
const MAX_LABEL_CHARS = 400;
const MAX_VALUE_CHARS = 2000;

// حد الرسائل لكل عنوان IP، حماية من الإغراق.
const RATE_LIMIT = 5;
const RATE_WINDOW_SECONDS = 600;

ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(int $status, array $body = []): void
{
    http_response_code($status);
    echo json_encode($body ?: new stdClass(), JSON_UNESCAPED_UNICODE);
    exit;
}

function clean($value, int $maxChars): string
{
    if (!is_string($value)) {
        return '';
    }
    $text = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', trim($value)) ?? '';
    return preg_match('/^.{0,' . $maxChars . '}/us', $text, $match) ? $match[0] : '';
}

function validPhone(string $phone): bool
{
    $digits = strlen(preg_replace('/\D/', '', $phone) ?? '');
    return preg_match('/^\+?[\d\s\-()]+$/', $phone) === 1 && $digits >= 8 && $digits <= 15;
}

function validEmail(string $email): bool
{
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/** يعيد أخطاء الحقول الأساسية؛ بقية الحقول تصل كما أجاب عنها المستخدم. */
function fieldErrors(string $form, array $answers): array
{
    $errors = [];
    if (clean($answers['name'] ?? '', MAX_VALUE_CHARS) === '') {
        $errors['name'] = 'يرجى كتابة الاسم.';
    }
    $phone = clean($answers['phone'] ?? '', 40);
    $email = clean($answers['email'] ?? '', 120);

    if ($form === 'apply') {
        if (!validPhone($phone)) {
            $errors['phone'] = 'يرجى كتابة رقم هاتف صحيح مع رمز الدولة، بالأرقام فقط.';
        }
        if (($answers['consent'] ?? false) !== true) {
            $errors['consent'] = 'يلزم الموافقة على الإقرار لإرسال الطلب.';
        }
        return $errors;
    }

    if (clean($answers['message'] ?? '', MAX_VALUE_CHARS) === '') {
        $errors['message'] = 'يرجى كتابة رسالتك.';
    }
    $replyVia = $answers['replyVia'] ?? '';
    if ($replyVia === 'email' && !validEmail($email)) {
        $errors['email'] = 'يرجى كتابة بريد إلكتروني صحيح، مثل name@example.com.';
    } elseif ($replyVia === 'whatsapp' && !validPhone($phone)) {
        $errors['phone'] = 'يرجى كتابة رقم هاتف صحيح مع رمز الدولة، بالأرقام فقط.';
    } elseif ($replyVia !== 'email' && $replyVia !== 'whatsapp') {
        $errors['replyVia'] = 'يرجى اختيار إجابة.';
    }
    return $errors;
}

/** يعيد المجموعات بصيغة [title, rows] وكل صف [label, value]، بعد تنظيف ما وصل من المتصفح. */
function readSummary(array $summary): array
{
    $groups = [];
    foreach (array_slice($summary, 0, 16) as $group) {
        $rows = [];
        $sourceRows = is_array($group) ? ($group['rows'] ?? []) : [];
        foreach (is_array($sourceRows) ? array_slice($sourceRows, 0, 100) : [] as $row) {
            $label = clean(is_array($row) ? ($row['label'] ?? '') : '', MAX_LABEL_CHARS);
            $value = clean(is_array($row) ? ($row['value'] ?? '') : '', MAX_VALUE_CHARS);
            if ($label !== '' && $value !== '') {
                $rows[] = [$label, $value];
            }
        }
        if ($rows) {
            $groups[] = [clean($group['title'] ?? '', MAX_LABEL_CHARS), $rows];
        }
    }
    return $groups;
}

function clientIp(): string
{
    // آخر عنوان أضافه الـCDN نفسه، أما ما قبله فيمكن للمرسل تزويره.
    $forwarded = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '');
    return trim((string) end($forwarded)) ?: ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
}

/** يسجل محاولة ويعيد true إن تجاوز العنوان الحد. عند تعذّر الملف يمر الطلب حتى لا يُرفض مستخدم حقيقي. */
function overRateLimit(string $ip): bool
{
    $file = fopen(sys_get_temp_dir() . '/bidayah-rate-' . sha1($ip), 'c+');
    if ($file === false || !flock($file, LOCK_EX)) {
        return false;
    }
    $now = time();
    $stamps = json_decode((string) stream_get_contents($file), true);
    $recent = array_values(array_filter(
        is_array($stamps) ? $stamps : [],
        static fn ($stamp) => is_int($stamp) && $stamp > $now - RATE_WINDOW_SECONDS
    ));
    $over = count($recent) >= RATE_LIMIT;
    if (!$over) {
        $recent[] = $now;
    }
    rewind($file);
    ftruncate($file, 0);
    fwrite($file, (string) json_encode($recent));
    flock($file, LOCK_UN);
    fclose($file);
    return $over;
}

/** ترويسة بريد عربية، مقسمة حتى لا يتجاوز السطر الحد المسموح. */
function encodeHeader(string $text): string
{
    preg_match_all('/.{1,15}/us', $text, $chunks);
    $words = array_map(static fn ($chunk) => '=?UTF-8?B?' . base64_encode($chunk) . '?=', $chunks[0]);
    return implode("\r\n ", $words);
}

function renderBodies(string $title, array $groups): array
{
    $escape = static fn (string $text) => htmlspecialchars($text, ENT_QUOTES, 'UTF-8');
    $cell = 'padding:8px 10px;border:1px solid #e3e3e3;vertical-align:top;text-align:right;';

    $text = $title . "\n";
    $html = '<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;font-size:15px;line-height:1.7;color:#222;">'
        . '<h2 style="margin:0 0 16px;font-size:18px;">' . $escape($title) . '</h2>';

    foreach ($groups as [$groupTitle, $rows]) {
        $text .= "\n";
        if ($groupTitle !== '') {
            $text .= '== ' . $groupTitle . " ==\n";
            $html .= '<h3 style="margin:20px 0 8px;font-size:16px;">' . $escape($groupTitle) . '</h3>';
        }
        $html .= '<table dir="rtl" style="width:100%;border-collapse:collapse;">';
        foreach ($rows as [$label, $value]) {
            $text .= $label . ': ' . $value . "\n";
            $html .= '<tr><td style="' . $cell . 'width:40%;background:#f6f6f6;">' . $escape($label) . '</td>'
                . '<td dir="auto" style="' . $cell . '">' . nl2br($escape($value)) . '</td></tr>';
        }
        $html .= '</table>';
    }
    return [$text, $html . '</div>'];
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    respond(405);
}
$form = $_GET['form'] ?? '';
if (!is_string($form) || !isset(FORMS[$form])) {
    respond(404);
}
// اشتراط JSON يمنع المواقع الأخرى من الإرسال من متصفح الزائر، لأنه يتطلب إذن CORS لا يمنحه هذا الملف.
if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0) {
    respond(415);
}

$raw = file_get_contents('php://input', false, null, 0, MAX_BODY_BYTES + 1);
if ($raw === false || strlen($raw) > MAX_BODY_BYTES) {
    respond(413);
}
$data = json_decode($raw, true);
$answers = $data['answers'] ?? null;
$summary = $data['summary'] ?? null;
if (!is_array($answers) || !is_array($summary)) {
    respond(400);
}

$errors = fieldErrors($form, $answers);
if ($errors) {
    respond(422, ['fieldErrors' => $errors]);
}
$groups = readSummary($summary);
if (!$groups) {
    respond(400);
}
if (overRateLimit(clientIp())) {
    respond(429);
}

$title = FORMS[$form] . ' — ' . clean($answers['name'], 80);
[$text, $html] = renderBodies($title, $groups);

$boundary = 'bidayah-' . bin2hex(random_bytes(12));
$part = static fn (string $type, string $content) => "--{$boundary}\r\n"
    . "Content-Type: {$type}; charset=UTF-8\r\n"
    . "Content-Transfer-Encoding: base64\r\n\r\n"
    . chunk_split(base64_encode($content)) . "\r\n";
$body = $part('text/plain', $text) . $part('text/html', $html) . "--{$boundary}--\r\n";

$headers = [
    'From: ' . encodeHeader(MAIL_FROM_NAME) . ' <' . MAIL_FROM . '>',
    'MIME-Version: 1.0',
    "Content-Type: multipart/alternative; boundary=\"{$boundary}\"",
];
$replyTo = clean($answers['email'] ?? '', 120);
if (validEmail($replyTo)) {
    $headers[] = 'Reply-To: ' . $replyTo;
}

$sent = mail(MAIL_TO, encodeHeader($title), $body, implode("\r\n", $headers), '-f' . MAIL_FROM);
respond($sent ? 200 : 500, ['ok' => $sent]);
