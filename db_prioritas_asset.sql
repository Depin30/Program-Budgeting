-- phpMyAdmin SQL Dump
-- version 5.1.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Waktu pembuatan: 09 Nov 2026 pada 01.55
-- Versi server: 5.7.24
-- Versi PHP: 8.3.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_prioritas_asset`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `prioritas_asset`
--

CREATE TABLE `prioritas_asset` (
  `id` int(11) NOT NULL,
  `prioritas_ke` int(11) NOT NULL,
  `departemen` varchar(150) NOT NULL,
  `nama_asset` varchar(255) NOT NULL,
  `alokasi` text NOT NULL,
  `qty` int(11) NOT NULL,
  `harga_satuan` decimal(15,2) NOT NULL,
  `total_harga` decimal(15,2) GENERATED ALWAYS AS ((`qty` * `harga_satuan`)) STORED,
  `jan_qty` int(11) DEFAULT '0',
  `jan_rp` decimal(15,2) DEFAULT '0.00',
  `feb_qty` int(11) DEFAULT '0',
  `feb_rp` decimal(15,2) DEFAULT '0.00',
  `mar_qty` int(11) DEFAULT '0',
  `mar_rp` decimal(15,2) DEFAULT '0.00',
  `apr_qty` int(11) DEFAULT '0',
  `apr_rp` decimal(15,2) DEFAULT '0.00',
  `mei_qty` int(11) DEFAULT '0',
  `mei_rp` decimal(15,2) DEFAULT '0.00',
  `jun_qty` int(11) DEFAULT '0',
  `jun_rp` decimal(15,2) DEFAULT '0.00',
  `jul_qty` int(11) DEFAULT '0',
  `jul_rp` decimal(15,2) DEFAULT '0.00',
  `agt_qty` int(11) DEFAULT '0',
  `agt_rp` decimal(15,2) DEFAULT '0.00',
  `sep_qty` int(11) DEFAULT '0',
  `sep_rp` decimal(15,2) DEFAULT '0.00',
  `okt_qty` int(11) DEFAULT '0',
  `okt_rp` decimal(15,2) DEFAULT '0.00',
  `nov_qty` int(11) DEFAULT '0',
  `nov_rp` decimal(15,2) DEFAULT '0.00',
  `des_qty` int(11) DEFAULT '0',
  `des_rp` decimal(15,2) DEFAULT '0.00',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `tahun` int(11) DEFAULT '2026',
  `jan_real` int(11) NOT NULL DEFAULT '0',
  `feb_real` int(11) NOT NULL DEFAULT '0',
  `mar_real` int(11) NOT NULL DEFAULT '0',
  `apr_real` int(11) NOT NULL DEFAULT '0',
  `mei_real` int(11) NOT NULL DEFAULT '0',
  `jun_real` int(11) NOT NULL DEFAULT '0',
  `jul_real` int(11) NOT NULL DEFAULT '0',
  `agt_real` int(11) NOT NULL DEFAULT '0',
  `sep_real` int(11) NOT NULL DEFAULT '0',
  `okt_real` int(11) NOT NULL DEFAULT '0',
  `nov_real` int(11) NOT NULL DEFAULT '0',
  `des_real` int(11) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data untuk tabel `prioritas_asset`
--

INSERT INTO `prioritas_asset` (`id`, `prioritas_ke`, `departemen`, `nama_asset`, `alokasi`, `qty`, `harga_satuan`, `jan_qty`, `jan_rp`, `feb_qty`, `feb_rp`, `mar_qty`, `mar_rp`, `apr_qty`, `apr_rp`, `mei_qty`, `mei_rp`, `jun_qty`, `jun_rp`, `jul_qty`, `jul_rp`, `agt_qty`, `agt_rp`, `sep_qty`, `sep_rp`, `okt_qty`, `okt_rp`, `nov_qty`, `nov_rp`, `des_qty`, `des_rp`, `created_at`, `tahun`, `jan_real`, `feb_real`, `mar_real`, `apr_real`, `mei_real`, `jun_real`, `jul_real`, `agt_real`, `sep_real`, `okt_real`, `nov_real`, `des_real`) VALUES
(13, 1, 'DEPARTMENT PENGEMBANGAN BISNIS', 'Mini pc core i5', 'test', 6, '5250000.00', 1, '0.00', 0, '0.00', 0, '0.00', 0, '0.00', 1, '0.00', 0, '0.00', 0, '0.00', 2, '0.00', 0, '0.00', 1, '0.00', 0, '0.00', 1, '0.00', '2026-10-20 01:17:43', 2026, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(14, 2, 'DEPARTMENT HRD', 'Hardisk', 'test', 2, '256000.00', 0, '0.00', 0, '0.00', 1, '0.00', 0, '0.00', 0, '0.00', 0, '0.00', 0, '0.00', 0, '0.00', 0, '0.00', 0, '0.00', 1, '0.00', 0, '0.00', '2026-10-20 01:18:11', 2026, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(15, 2, 'DEPARTMENT UMUM', 'keyboard', 'test', 15, '96000.00', 5, '0.00', 2, '0.00', 0, '0.00', 0, '0.00', 0, '0.00', 1, '0.00', 0, '0.00', 3, '0.00', 0, '0.00', 3, '0.00', 1, '0.00', 0, '0.00', '2026-10-20 01:38:24', 2026, 2, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0),
(16, 3, 'DEPARTMENT PENUNJANG MEDIS', 'Microserver ', 'P.Saraf, P,Urologi', 5, '150000.00', 2, '0.00', 0, '0.00', 0, '0.00', 0, '0.00', 0, '0.00', 0, '0.00', 0, '0.00', 0, '0.00', 3, '0.00', 0, '0.00', 0, '0.00', 0, '0.00', '2026-10-21 01:58:05', 2026, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(17, 1, 'DEPARTMENT PENGEMBANGAN BISNIS', 'ups', 'ruang it', 2, '1500000.00', 0, '0.00', 1, '0.00', 0, '0.00', 0, '0.00', 0, '0.00', 0, '0.00', 0, '0.00', 0, '0.00', 0, '0.00', 0, '0.00', 0, '0.00', 0, '0.00', '2026-10-21 06:13:52', 2026, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(18, 1, 'DEPARTMENT KEPERAWATAN', 'monitor', 'test', 2, '120000.00', 0, '0.00', 0, '0.00', 0, '0.00', 0, '0.00', 0, '0.00', 0, '0.00', 0, '0.00', 0, '0.00', 0, '0.00', 0, '0.00', 1, '0.00', 1, '0.00', '2026-10-27 04:45:56', 2026, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(19, 1, 'DEPARTMENT HRD', 'Kipas Angin', 'test', 2, '499998.00', 2, '0.00', 0, '0.00', 0, '0.00', 0, '0.00', 0, '0.00', 0, '0.00', 0, '0.00', 0, '0.00', 0, '0.00', 0, '0.00', 0, '0.00', 0, '0.00', '2026-11-04 06:19:58', 2026, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

-- --------------------------------------------------------

--
-- Struktur dari tabel `riwayat_perubahan`
--

CREATE TABLE `riwayat_perubahan` (
  `id` int(11) NOT NULL,
  `waktu` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` int(11) DEFAULT NULL,
  `username` varchar(100) NOT NULL,
  `role` varchar(20) NOT NULL,
  `aksi` varchar(20) NOT NULL,
  `objek` varchar(20) NOT NULL,
  `objek_id` int(11) DEFAULT NULL,
  `ringkasan` varchar(255) DEFAULT NULL,
  `detail` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data untuk tabel `riwayat_perubahan`
--

INSERT INTO `riwayat_perubahan` (`id`, `waktu`, `user_id`, `username`, `role`, `aksi`, `objek`, `objek_id`, `ringkasan`, `detail`) VALUES
(1, '2026-11-04 06:19:58', 8, 'lili', 'user', 'tambah', 'asset', 19, 'Kipas Angin (DEPARTMENT HRD)', '{\"tahun\":\"2026\",\"qty\":\"2\",\"harga_satuan\":\"499998\"}'),
(2, '2026-11-04 06:21:25', 6, 'rsck', 'admin', 'tambah', 'akun', 9, 'lolo (user, DEPARTMENT KEPERAWATAN)', NULL),
(3, '2026-11-05 01:15:24', 6, 'rsck', 'admin', 'tambah', 'akun', 10, 'hari (user, DEPARTMENT UMUM)', NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `role` varchar(20) NOT NULL DEFAULT 'admin',
  `departemen` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `created_at`, `role`, `departemen`) VALUES
(6, 'rsck', '$2b$10$c8c5oqEIt.lj9bvC3anDFusxebrvbxByKnmVVWi/eH.v1zuclSPFe', '2026-10-14 01:32:26', 'admin', NULL),
(8, 'lili', '$2b$10$OmVFE6bdNz9yddLFsTwFQ.Sj.1KtydiZGl0gRHHUA5b6UVJX8k.CS', '2026-10-27 04:41:32', 'user', 'DEPARTMENT HRD'),
(9, 'lolo', '$2b$10$8duazTsuEHyqqQIryI5wLusEb3u7aXfJZKkn4ODNd3J26x880QB56', '2026-11-04 06:21:25', 'user', 'DEPARTMENT KEPERAWATAN'),
(10, 'hari', '$2b$10$Cw0lmSVoGKfV62Y53QpOMubp0G5MxFrQjzrx9jKh6aQe9IfjW86Di', '2026-11-05 01:15:24', 'user', 'DEPARTMENT UMUM');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `prioritas_asset`
--
ALTER TABLE `prioritas_asset`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `riwayat_perubahan`
--
ALTER TABLE `riwayat_perubahan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_waktu` (`waktu`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `prioritas_asset`
--
ALTER TABLE `prioritas_asset`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT untuk tabel `riwayat_perubahan`
--
ALTER TABLE `riwayat_perubahan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
