<?php
$roots = ['/ssd/www/hiddifysales', '/ssd/www/fullvpnservice', '/var/www/hiddifysales', '/ssd/www/rushvpn'];
$root = null;
foreach ($roots as $r) {
    if (is_file($r.'/artisan')) { $root = $r; break; }
}
if (!$root) {
    echo "NO_APP\n";
    foreach (glob('/ssd/www/*') ?: [] as $d) echo basename($d)."\n";
    exit(1);
}
chdir($root);
require $root.'/vendor/autoload.php';
$app = require $root.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$rows = App\Models\PaymentGateway::query()
    ->orderBy('id')
    ->get(['id','code','name','enabled','test_mode','min_amount_rub','config']);

$out = [];
foreach ($rows as $r) {
    $cfg = is_array($r->config) ? $r->config : [];
    // Mask secrets: keep keys list + whether non-empty
    $masked = [];
    foreach ($cfg as $k => $v) {
        if (is_array($v)) {
            $masked[$k] = ['type' => 'array', 'keys' => array_keys($v)];
        } elseif (is_string($v) && $v !== '') {
            $masked[$k] = ['set' => true, 'len' => strlen($v), 'hint' => substr($v, 0, 3).'***'];
        } else {
            $masked[$k] = $v;
        }
    }
    $out[] = [
        'code' => $r->code,
        'name' => $r->name,
        'enabled' => (bool) $r->enabled,
        'test_mode' => (bool) $r->test_mode,
        'min_amount_rub' => $r->min_amount_rub,
        'config_keys' => array_keys($cfg),
        'config_meta' => $masked,
    ];
}
echo json_encode(['root' => $root, 'gateways' => $out], JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT);
