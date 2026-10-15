"""Optional source refresh. Does not change the original Excel."""
import hashlib,json,sys
from pathlib import Path
from prepare_data import ROOT,build
def main(path):
    import openpyxl
    book=openpyxl.load_workbook(path,read_only=True,data_only=True)
    raw=dict(source_file=Path(path).name,source_sha256=hashlib.sha256(Path(path).read_bytes()).hexdigest(),
        sheets={s.title:[list(row) for row in s.values] for s in book})
    book.close()
    (ROOT/'data/osan-source.json').write_text(json.dumps(raw,ensure_ascii=False,indent=2,default=str),encoding='utf-8')
    build()
if __name__=='__main__': main(sys.argv[1])
