<?php
session_start();
require_once __DIR__ . '/../admin/config.php';
require_once __DIR__ . '/../includes/db.php';

$loggedIn = !empty($_SESSION['admin_logged_in']);

if (!$loggedIn && $_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login'])) {
    $user = trim($_POST['username'] ?? '');
    $pass = (string) ($_POST['password'] ?? '');
    if ($user === ADMIN_USERNAME && hash_equals(ADMIN_PASSWORD, $pass)) {
        $_SESSION['admin_logged_in'] = true;
        $loggedIn = true;
    } else {
        $loginError = 'Incorrect username or password.';
    }
}

if ($loggedIn && $_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['logout'])) {
    $_SESSION = [];
    session_destroy();
    header('Location: index.php');
    exit;
}

if ($loggedIn && $_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['delete_id'])) {
    $id = (int) $_POST['delete_id'];
    $stmt = db()->prepare('DELETE FROM signups WHERE id = ?');
    $stmt->execute([$id]);
    header('Location: index.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Depiction Solutions — Signup Panel</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
<style>
:root { --bg:#f5f7ff; --card:#ffffff; --border:rgba(15,20,48,.12); --text:#111530; --muted:#5a6388; --primary:#4f46e5; --accent:#0891b2; --danger:#dc2626; --good:#059669; }
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);line-height:1.6}
h1,h2,h3,h4{font-family:'Sora',sans-serif;letter-spacing:-.02em}
a{color:inherit;text-decoration:none}
.wrap{max-width:1120px;margin:0 auto;padding:28px 24px 80px}
.topbar{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;padding:20px 24px;background:var(--card);border:1px solid var(--border);border-radius:18px;margin-bottom:26px}
.brand{display:flex;align-items:center;gap:12px}
.logo{width:44px;height:44px;border-radius:12px;background:#fff;padding:6px;object-fit:contain}
.brand b{font-family:'Sora',sans-serif;font-size:18px}
.brand small{display:block;color:var(--muted);font-weight:400;font-size:12px}
.badge{font-size:12px;padding:5px 12px;border-radius:999px;border:1px solid var(--border);color:var(--muted)}
.btn{display:inline-flex;align-items:center;gap:8px;padding:11px 18px;border-radius:12px;font-weight:600;font-size:14px;font-family:'Inter',sans-serif;border:1px solid var(--border);cursor:pointer;background:rgba(15,20,48,.055);color:var(--text);transition:.2s}
.btn:hover{background:rgba(15,20,48,.1)}
.btn-primary{background:linear-gradient(135deg,#6366f1,#8b5cf6);border:none;color:#fff}
.btn-primary:hover{filter:brightness(1.1)}
.btn-green{background:rgba(52,211,153,.15);border-color:rgba(52,211,153,.35);color:var(--good)}
.btn-danger{background:rgba(248,113,113,.12);border-color:rgba(248,113,113,.3);color:var(--danger);padding:6px 12px;font-size:13px}
.banner{display:flex;gap:12px;align-items:flex-start;padding:16px 20px;border-radius:14px;margin-bottom:22px;background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.35);color:#fcd34d;font-size:14px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:16px;margin-bottom:30px}
.stat{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:20px}
.stat .num{font-family:'Sora',sans-serif;font-size:30px;font-weight:800;background:linear-gradient(120deg,#4f46e5,#22d3ee);-webkit-background-clip:text;background-clip:text;color:transparent}
.stat .lbl{color:var(--muted);font-size:13px;margin-top:4px}
.panel{background:var(--card);border:1px solid var(--border);border-radius:18px;overflow:hidden}
.panel-head{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;padding:18px 22px;border-bottom:1px solid var(--border)}
.panel-head h2{font-size:17px}
.actions{display:flex;gap:10px;flex-wrap:wrap}
.table-scroll{overflow-x:auto}
table{width:100%;border-collapse:collapse;font-size:14px}
th,td{text-align:left;padding:12px 16px;border-bottom:1px solid var(--border);vertical-align:top}
th{color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.06em;font-weight:600}
tr:hover td{background:rgba(99,102,241,.06)}
.chip{display:inline-block;font-size:12px;font-weight:600;padding:3px 10px;border-radius:999px}
.chip.blue{background:rgba(99,102,241,.18);color:#c7cbff}
.chip.cyan{background:rgba(34,211,238,.15);color:#67e8f9}
.chip.pink{background:rgba(240,171,252,.15);color:#f0abfc}
.del-form{display:inline}
.empty{text-align:center;padding:60px 20px;color:var(--muted)}
.empty .ic{font-size:42px;margin-bottom:12px}
.login-card{max-width:420px;margin:60px auto;background:var(--card);border:1px solid var(--border);border-radius:20px;padding:40px}
.login-card h1{font-size:22px;margin-bottom:8px;text-align:center}
.login-card p{color:var(--muted);font-size:14px;text-align:center;margin-bottom:26px}
.login-card input{width:100%;padding:13px 15px;border-radius:12px;font-size:15px;background:rgba(15,20,48,.06);border:1px solid rgba(15,20,48,.1);color:var(--text);margin-bottom:14px}
.login-card input:focus{outline:none;border-color:#6366f1}
.login-card .btn{width:100%;justify-content:center;margin-bottom:10px}
.err{color:var(--danger);font-size:13.5px;text-align:center;margin-bottom:12px}
.timestamp{color:var(--muted);font-size:13px}
.muted{color:var(--muted)}
</style>
</head>
<body>

<?php if (!$loggedIn): ?>

  <div class="wrap">
    <form class="login-card" method="post" action="index.php">
      <h1>Depiction Solutions Signup Panel</h1>
      <p>Log in to view who signed up for the workshops.</p>
      <?php if (!empty($loginError)): ?><div class="err"><?php echo htmlspecialchars($loginError); ?></div><?php endif; ?>
      <input type="text" name="username" placeholder="Username" required autocomplete="username" />
      <input type="password" name="password" placeholder="Password" required autocomplete="current-password" />
      <button class="btn btn-primary" type="submit" name="login" value="1">Log In</button>
      <p class="muted" style="font-size:12.5px">Contact the page owner for login details.</p>
    </form>
  </div>

<?php else: ?>

  <div class="wrap">
    <div class="topbar">
      <div class="brand">
        <img class="logo" src="../assets/logo.png" alt="Depiction Solutions logo" />
        <span><b>Depiction Solutions Signup Panel</b><small>Seeing Possibilities, Delivering Solutions</small></span>
      </div>
      <div style="display:flex;gap:10px;align-items:center">
        <a class="btn" href="../index.html#signup" target="_blank">&#128279; Open landing page</a>
        <form method="post" style="display:inline"><button class="btn" name="logout" value="1">Log out</button></form>
      </div>
    </div>

    <?php if (ADMIN_PASSWORD === 'change-me-please'): ?>
      <div class="banner">
        <span>&#9888;</span>
        <div><strong>Default password still active.</strong> Change it now: open <code>admin/config.php</code> and set a real value for <code>ADMIN_PASSWORD</code>.</div>
      </div>
    <?php endif; ?>

    <?php
    $pdo = db();
    $total   = (int) $pdo->query('SELECT COUNT(*) FROM signups')->fetchColumn();
    $evening = (int) $pdo->query("SELECT COUNT(*) FROM signups WHERE class_time = 'Evening classes'")->fetchColumn();
    $weekend = (int) $pdo->query("SELECT COUNT(*) FROM signups WHERE class_time = 'Weekend classes'")->fetchColumn();
    $l1      = (int) $pdo->query("SELECT COUNT(*) FROM signups WHERE level LIKE 'L1%'")->fetchColumn();
    $l2      = (int) $pdo->query("SELECT COUNT(*) FROM signups WHERE level LIKE 'L2%'")->fetchColumn();
    $rows    = $pdo->query('SELECT * FROM signups ORDER BY id DESC')->fetchAll(PDO::FETCH_ASSOC);
    ?>

    <div class="stats">
      <div class="stat"><div class="num"><?php echo $total; ?></div><div class="lbl">Total signups</div></div>
      <div class="stat"><div class="num"><?php echo $evening; ?></div><div class="lbl">Evening classes</div></div>
      <div class="stat"><div class="num"><?php echo $weekend; ?></div><div class="lbl">Weekend classes</div></div>
      <div class="stat"><div class="num"><?php echo $l1; ?></div><div class="lbl">L1 Beginner</div></div>
      <div class="stat"><div class="num"><?php echo $l2; ?></div><div class="lbl">L2 Advanced</div></div>
    </div>

    <div class="panel">
      <div class="panel-head">
        <h2>Signups (<?php echo $total; ?>)</h2>
        <div class="actions">
          <a class="btn btn-green" href="export.php?format=csv">&#11015; Download CSV</a>
          <a class="btn btn-primary" href="export.php?format=xlsx">&#11015; Download Excel (.xlsx)</a>
        </div>
      </div>
      <div class="table-scroll">
        <?php if (!$rows): ?>
          <div class="empty"><div class="ic">&#128203;</div><p>No signups yet.</p><p class="muted">When people submit the landing page form, they'll appear here.</p></div>
        <?php else: ?>
          <table>
            <thead>
              <tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Profession</th><th>Class time</th><th>Level</th><th>Note</th><th>Submitted</th><th></th></tr>
            </thead>
            <tbody>
              <?php foreach ($rows as $r): ?>
              <tr>
                <td class="muted"><?php echo (int)$r['id']; ?></td>
                <td><strong><?php echo htmlspecialchars($r['full_name']); ?></strong></td>
                <td><a href="mailto:<?php echo htmlspecialchars($r['email']); ?>" style="color:#4f46e5"><?php echo htmlspecialchars($r['email']); ?></a></td>
                <td><?php echo htmlspecialchars($r['phone']); ?></td>
                <td><?php echo htmlspecialchars($r['profession']); ?></td>
                <td>
                  <?php if ($r['class_time'] === 'Evening classes'): ?><span class="chip cyan">Evening</span>
                  <?php else: ?><span class="chip blue">Weekend</span><?php endif; ?>
                </td>
                <td>
                  <?php if (strpos($r['level'], 'L2') === 0): ?><span class="chip pink">L2 Advanced</span>
                  <?php else: ?><span class="chip blue">L1 Beginner</span><?php endif; ?>
                </td>
                <td class="muted"><?php echo $r['message'] ? htmlspecialchars($r['message']) : '&mdash;'; ?></td>
                <td class="timestamp"><?php echo htmlspecialchars(date('d M Y H:i', strtotime($r['submitted_at']))); ?></td>
                <td>
                  <form class="del-form" method="post" onsubmit="return confirm('Delete this signup?');">
                    <input type="hidden" name="delete_id" value="<?php echo (int)$r['id']; ?>" />
                    <button class="btn btn-danger" type="submit">&#10005;</button>
                  </form>
                </td>
              </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        <?php endif; ?>
      </div>
    </div>
  </div>

<?php endif; ?>

</body>
</html>