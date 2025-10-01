# import aiohttp
# import asyncio
# import ssl
# import certifi
# import time
# from aiohttp import ClientConnectorCertificateError
# from ssl import SSLCertVerificationError
# from ssl import SSLError


# TIMEOUT_MS = 30000  # 30초

# async def check_site(url: str, insecure_retry: bool = False):
#     ssl_ctx = ssl.create_default_context(cafile=certifi.where())
#     start = time.monotonic()
#     try:
#         async with aiohttp.ClientSession() as session:
#             async with session.get(
#                 url,
#                 timeout=aiohttp.ClientTimeout(total=TIMEOUT_MS/1000),
#                 ssl=ssl_ctx
#             ) as resp:
#                 body = await resp.read()
#                 elapsed = int((time.monotonic() - start) * 1000)
#                 status = "normal" if resp.status == 200 else "problem"
#                 # 점검 키워드 검사
#                 text = body.decode(errors="ignore").lower()
#                 for kw in ("점검","일시중단","서비스중단","maintenance"):
#                     if kw in text:
#                         status = "maintenance"
#                         break
#                 return {"url": url, "status": status, "httpStatus": resp.status, "responseTime": elapsed}

#     except (ClientConnectorCertificateError, SSLCertVerificationError) as e:
#         if insecure_retry:
#             # ssl 검증 끄고 재시도
#             async with aiohttp.ClientSession() as session:
#                 async with session.get(
#                   url,
#                   timeout=aiohttp.ClientTimeout(total=TIMEOUT_MS/1000),
#                   ssl=False   # 👈 SSL 검증 끔
#               ) as resp:
#                   elapsed = int((time.monotonic() - start) * 1000)
#                   return {
#                       "url": url,
#                       "httpStatus": resp.status,
#                       "responseTime": elapsed,
#                       "status": "normal" if resp.status == 200 else "problem"
#                   }
#         return {"url": url, "status": "ssl_cert", "error": str(e)}

#     except SSLError as e:
#         if "handshake failure" in str(e).lower() or "dh key too small" in str(e).lower():
#             print(f"⚠️ SSL 핸드셰이크 실패: {url} → {e}")
#             try:
#                 async with aiohttp.ClientSession() as insecure_session:
#                     async with insecure_session.get(
#                         url,
#                         allow_redirects=True,
#                         timeout=aiohttp.ClientTimeout(total=TIMEOUT_MS/1000),
#                         ssl=False
#                     ) as response:
#                         raw = await response.read()
#                         response_time = int((time.monotonic() - start_time) * 1000)
#                         status = "normal" if response.status == 200 else "problem"
#                         print(f"🔁 insecure handshake retry 성공: {url} → {status}")
#             except Exception as e2:
#                 print(f"❌ insecure handshake retry 실패: {url} → {e2}")
#                 status = "problem"
#                 response_time = TIMEOUT_MS

#     except Exception as e:
#         return {"url": url, "status": "problem", "error": str(e)}

# # 실행 예시
# if __name__ == "__main__":
#     url = "https://www.sports.or.kr"
#     result = asyncio.run(check_site(url, insecure_retry=True))
#     print(result)
