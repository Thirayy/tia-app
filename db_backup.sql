--
-- PostgreSQL database dump
--

\restrict q4gtlhrsZYRkDdXoTkIAuZV5tg8Jfv9YTRLgQOR8SStLfwTKj1cVoPpDpEVVIGX

-- Dumped from database version 14.23 (Ubuntu 14.23-0ubuntu0.22.04.1)
-- Dumped by pg_dump version 14.23 (Ubuntu 14.23-0ubuntu0.22.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: halaqah_disruptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.halaqah_disruptions (
    id integer NOT NULL,
    tanggal timestamp without time zone NOT NULL,
    kelompok_id integer NOT NULL,
    musyrif_id integer NOT NULL,
    badal_musyrif_id integer,
    alasan character varying NOT NULL,
    status_halaqah character varying NOT NULL
);


ALTER TABLE public.halaqah_disruptions OWNER TO postgres;

--
-- Name: halaqah_disruptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.halaqah_disruptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.halaqah_disruptions_id_seq OWNER TO postgres;

--
-- Name: halaqah_disruptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.halaqah_disruptions_id_seq OWNED BY public.halaqah_disruptions.id;


--
-- Name: kelompok_halaqah; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kelompok_halaqah (
    id integer NOT NULL,
    nama_kelompok character varying NOT NULL,
    musyrif_id integer
);


ALTER TABLE public.kelompok_halaqah OWNER TO postgres;

--
-- Name: kelompok_halaqah_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.kelompok_halaqah_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.kelompok_halaqah_id_seq OWNER TO postgres;

--
-- Name: kelompok_halaqah_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.kelompok_halaqah_id_seq OWNED BY public.kelompok_halaqah.id;


--
-- Name: quran_verses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quran_verses (
    id integer NOT NULL,
    surah_id integer NOT NULL,
    surah_name character varying NOT NULL,
    ayah_number integer NOT NULL,
    text_arabic character varying NOT NULL,
    text_id character varying NOT NULL,
    tafsir_wajiz character varying NOT NULL
);


ALTER TABLE public.quran_verses OWNER TO postgres;

--
-- Name: quran_verses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.quran_verses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.quran_verses_id_seq OWNER TO postgres;

--
-- Name: quran_verses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.quran_verses_id_seq OWNED BY public.quran_verses.id;


--
-- Name: santri; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.santri (
    id integer NOT NULL,
    nama_santri character varying NOT NULL,
    nomor_induk character varying NOT NULL,
    status_santri character varying NOT NULL,
    kelompok_id integer
);


ALTER TABLE public.santri OWNER TO postgres;

--
-- Name: santri_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.santri_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.santri_id_seq OWNER TO postgres;

--
-- Name: santri_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.santri_id_seq OWNED BY public.santri.id;


--
-- Name: setoran_tahfizh; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.setoran_tahfizh (
    id integer NOT NULL,
    santri_id integer NOT NULL,
    surah character varying NOT NULL,
    ayat character varying NOT NULL,
    status_kelancaran character varying NOT NULL,
    catatan_musyrif character varying,
    ai_rekomendasi character varying
);


ALTER TABLE public.setoran_tahfizh OWNER TO postgres;

--
-- Name: setoran_tahfizh_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.setoran_tahfizh_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.setoran_tahfizh_id_seq OWNER TO postgres;

--
-- Name: setoran_tahfizh_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.setoran_tahfizh_id_seq OWNED BY public.setoran_tahfizh.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying NOT NULL,
    password_hash character varying NOT NULL,
    nama_lengkap character varying NOT NULL,
    role character varying NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: halaqah_disruptions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.halaqah_disruptions ALTER COLUMN id SET DEFAULT nextval('public.halaqah_disruptions_id_seq'::regclass);


--
-- Name: kelompok_halaqah id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kelompok_halaqah ALTER COLUMN id SET DEFAULT nextval('public.kelompok_halaqah_id_seq'::regclass);


--
-- Name: quran_verses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quran_verses ALTER COLUMN id SET DEFAULT nextval('public.quran_verses_id_seq'::regclass);


--
-- Name: santri id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.santri ALTER COLUMN id SET DEFAULT nextval('public.santri_id_seq'::regclass);


--
-- Name: setoran_tahfizh id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.setoran_tahfizh ALTER COLUMN id SET DEFAULT nextval('public.setoran_tahfizh_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: halaqah_disruptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.halaqah_disruptions (id, tanggal, kelompok_id, musyrif_id, badal_musyrif_id, alasan, status_halaqah) FROM stdin;
\.


--
-- Data for Name: kelompok_halaqah; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.kelompok_halaqah (id, nama_kelompok, musyrif_id) FROM stdin;
1	test	3
\.


--
-- Data for Name: quran_verses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quran_verses (id, surah_id, surah_name, ayah_number, text_arabic, text_id, tafsir_wajiz) FROM stdin;
\.


--
-- Data for Name: santri; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.santri (id, nama_santri, nomor_induk, status_santri, kelompok_id) FROM stdin;
1	test	1234	aktif	1
\.


--
-- Data for Name: setoran_tahfizh; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.setoran_tahfizh (id, santri_id, surah, ayat, status_kelancaran, catatan_musyrif, ai_rekomendasi) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password_hash, nama_lengkap, role) FROM stdin;
2	admin	admin123	Admin Portal	admin
3	user	user123	user	musyrif
\.


--
-- Name: halaqah_disruptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.halaqah_disruptions_id_seq', 1, false);


--
-- Name: kelompok_halaqah_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.kelompok_halaqah_id_seq', 1, true);


--
-- Name: quran_verses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.quran_verses_id_seq', 1, false);


--
-- Name: santri_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.santri_id_seq', 1, true);


--
-- Name: setoran_tahfizh_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.setoran_tahfizh_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: halaqah_disruptions halaqah_disruptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.halaqah_disruptions
    ADD CONSTRAINT halaqah_disruptions_pkey PRIMARY KEY (id);


--
-- Name: kelompok_halaqah kelompok_halaqah_nama_kelompok_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kelompok_halaqah
    ADD CONSTRAINT kelompok_halaqah_nama_kelompok_key UNIQUE (nama_kelompok);


--
-- Name: kelompok_halaqah kelompok_halaqah_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kelompok_halaqah
    ADD CONSTRAINT kelompok_halaqah_pkey PRIMARY KEY (id);


--
-- Name: quran_verses quran_verses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quran_verses
    ADD CONSTRAINT quran_verses_pkey PRIMARY KEY (id);


--
-- Name: santri santri_nomor_induk_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.santri
    ADD CONSTRAINT santri_nomor_induk_key UNIQUE (nomor_induk);


--
-- Name: santri santri_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.santri
    ADD CONSTRAINT santri_pkey PRIMARY KEY (id);


--
-- Name: setoran_tahfizh setoran_tahfizh_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.setoran_tahfizh
    ADD CONSTRAINT setoran_tahfizh_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: ix_users_username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_users_username ON public.users USING btree (username);


--
-- Name: kelompok_halaqah kelompok_halaqah_musyrif_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kelompok_halaqah
    ADD CONSTRAINT kelompok_halaqah_musyrif_id_fkey FOREIGN KEY (musyrif_id) REFERENCES public.users(id);


--
-- Name: santri santri_kelompok_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.santri
    ADD CONSTRAINT santri_kelompok_id_fkey FOREIGN KEY (kelompok_id) REFERENCES public.kelompok_halaqah(id);


--
-- Name: setoran_tahfizh setoran_tahfizh_santri_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.setoran_tahfizh
    ADD CONSTRAINT setoran_tahfizh_santri_id_fkey FOREIGN KEY (santri_id) REFERENCES public.santri(id);


--
-- PostgreSQL database dump complete
--

\unrestrict q4gtlhrsZYRkDdXoTkIAuZV5tg8Jfv9YTRLgQOR8SStLfwTKj1cVoPpDpEVVIGX

