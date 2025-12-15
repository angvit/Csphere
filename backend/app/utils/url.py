import ipaddress
import socket

from fastapi import HTTPException
from pydantic import HttpUrl
from urllib.parse import urlparse
import logging

logger = logging.getLogger(__name__)

def ensure_safe_url(url: HttpUrl) -> str:
    parsed_url = urlparse(str(url))
    logger.info("parsed_url=%r", parsed_url)

    if parsed_url.scheme not in {"http", "https"}:
        raise HTTPException(status_code=400, detail="Invalid URL scheme")

    if parsed_url.username or parsed_url.password:
        raise HTTPException(status_code=400, detail="URL must not contain credentials")

    hostname = parsed_url.hostname
    if not hostname:
        logger.error(f"Parsed hostname = {parsed_url.hostname!r}")
        raise HTTPException(status_code=400, detail="Invalid URL host")

    if hostname.lower() == "localhost":
        raise HTTPException(status_code=400, detail="URL host is not allowed")

    try:
        addrinfos = socket.getaddrinfo(hostname, parsed_url.port or 443, type=socket.SOCK_STREAM)
    except socket.gaierror:
        raise HTTPException(status_code=400, detail="URL host could not be resolved")

    global_ips =[]
    for addrinfo in addrinfos:
        ip = ipaddress.ip_address(addrinfo[4][0])
        if ip.is_global:
            global_ips.append(ip)

        if not global_ips:
            raise HTTPException(status_code=400, detail="URL host is not allowed")

    return parsed_url.geturl()
