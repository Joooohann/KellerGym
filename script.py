from html.parser import HTMLParser
class MyParser(HTMLParser):
  def __init__(self):
    super().__init__()
    self.stack = []
    self.void = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
  def handle_starttag(self, tag, attrs):
    if tag not in self.void: self.stack.append((tag, self.getpos()[0]))
  def handle_endtag(self, tag):
    if tag in self.void: return
    if self.stack and self.stack[-1][0] == tag:
      self.stack.pop()
    else:
      print(f'Line {self.getpos()[0]}: Found </{tag}> but expected {self.stack[-1]}')
parser=MyParser()
parser.feed(open('nutrition.html', encoding='utf-8').read())
