import os
import time
import psutil
from flask import Flask, jsonify, render_template

app = Flask(__name__)

REAL_FS = frozenset({
    'ext2', 'ext3', 'ext4', 'xfs', 'btrfs', 'zfs', 'ntfs', 'fuseblk',
    'cifs', 'smb2', 'nfs', 'nfs4', 'nfsd', 'hfsplus', 'apfs', 'reiserfs',
    'jfs', 'f2fs', 'exfat', 'vfat', 'fat32', 'iso9660', 'udf',
})

PSEUDO_FS = frozenset({
    'proc', 'sysfs', 'tmpfs', 'devtmpfs', 'devpts', 'cgroup', 'cgroup2',
    'pstore', 'efivarfs', 'autofs', 'mqueue', 'configfs', 'hugetlbfs',
    'debugfs', 'tracefs', 'ramfs', 'fusectl', 'securityfs', 'bpf', 'overlay',
    'aufs', 'squashfs', 'nsfs', 'binfmt_misc', 'rpc_pipefs', 'fuse.gvfsd-fuse',
    'fuse.portal', 'fuse.lxcfs', 'drvfs', '9p',
})

EXCLUDED_PATHS = frozenset({
    '/etc/hosts', '/etc/hostname', '/etc/resolv.conf',
    '/sys', '/proc', '/dev',
})

HOST_PREFIX = '/host'
HOST_PREFIX_LEN = len(HOST_PREFIX)

def clean_mount_path(mount):
    if mount.startswith(HOST_PREFIX):
        cleaned = mount[HOST_PREFIX_LEN:]
        return cleaned if cleaned else '/'
    return mount

def should_include(part):
    mount = part.mountpoint
    if part.fstype in PSEUDO_FS:
        return False
    if part.fstype not in REAL_FS:
        return False
    for exc in EXCLUDED_PATHS:
        if mount == exc or mount.startswith(exc + '/'):
            return False
    if mount.startswith('/host/proc') or mount.startswith('/host/sys') or mount.startswith('/host/dev'):
        return False
    if mount.startswith('/host/etc'):
        return False
    if os.path.ismount(mount):
        return True
    return False

def get_disk_usage(path):
    try:
        return psutil.disk_usage(path)
    except (PermissionError, FileNotFoundError, OSError):
        return None

@app.route('/api/disks')
def api_disks():
    parts = sorted(
        (p for p in psutil.disk_partitions(all=True) if should_include(p)),
        key=lambda p: p.mountpoint
    )
    disks = []
    idx = 0

    for part in parts:
        mount_path = part.mountpoint
        clean_path = clean_mount_path(mount_path)

        usage = get_disk_usage(mount_path)
        if usage is None:
            continue

        disks.append({
            'index': idx,
            'mount': clean_path if clean_path else '/',
            'total': usage.total,
            'used': usage.used,
            'free': usage.free,
            'percent': usage.percent,
            'fstype': part.fstype,
        })
        idx += 1

    return jsonify({
        'disks': disks,
        'count': len(disks),
        'timestamp': time.time()
    })

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 1337))
    app.run(host='0.0.0.0', port=port, debug=False)
